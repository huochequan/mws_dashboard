<?php

namespace App\Services\Trevco\AmazonSync;

use AmazonFeed;
use AmazonReport;
use AmazonReportList;
use AmazonReportRequest;
use AmazonReportRequestList;
use App\Exceptions\Amazon\AmazonReportException;
use App\Order;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;


abstract class AmazonService extends Command
{
    const WAIT_TIME = 240;

    const MAX_REPORT_REQUEST_ATTEMPTS = 5;

    /**
     * @var string
     */
    protected $configFile;

    /**
     * @var TwigEngine
     */
    protected $twig;

    /**
     * @var AmazonReportModelSync
     */
    protected $persistenceService;


    /**
     * @var OutputInterface
     */
    protected $output;

    /**
     * @var string
     */
    protected $reportType;

    /**
     * @var string
     */
    protected $dateRange;

    public function __construct($reportType, $persistenceService, $dateRange)
    {
        $this->configFile = config_path('amazon.php');
        $this->persistenceService = $persistenceService;
        $this->reportType = $reportType;
        $this->dateRange = $dateRange;
    }

    public function setOutput(OutputInterface $output)
    {
        $this->output = $output;
    }


    public function execute(InputInterface $input, OutputInterface $output)
    {
        $this->input = $input;
        $this->output = $output;
        try {
            $reportRequestId = $this->sendReportRequest();
            //$reportRequestId = 120998017240;
            $this->output->writeln(sprintf('Get report request ID %s for %s report type', $reportRequestId, $this->reportType));
        } catch (\Exception $ex) {
            dump($ex);
            $this->output->writeln('There was a problem with the Amazon library. Error: '.$ex->getMessage());
            return false;
        }


        $amazonReportData = null;
        $attempt = 1;

        while ($amazonReportData == null and $attempt <= self::MAX_REPORT_REQUEST_ATTEMPTS)
        {
            sleep(self::WAIT_TIME);
            $this->output->writeln(sprintf('Get report list, attempt #%s', $attempt));

            try {
                $amazonReportData = $this->fetchReportRequestList($reportRequestId);
                // dump($amazonReportData);
            } catch (\Exception $ex) {
                dump($ex);
                $this->output->writeln('There was a problem with the Amazon library. Error: '.$ex->getMessage());
                return false;
            }

            $attempt++;
        }

        // while ($amazonReportData == null and $attempt <= self::MAX_REPORT_REQUEST_ATTEMPTS)
        // {
        //     sleep(self::WAIT_TIME);
        //     $this->output->writeln(sprintf('Get report list, attempt #%s', $attempt));

        //     try {
        //         $amazonReportData = $this->fetchReportList($reportRequestId);
        //     } catch (\Exception $ex) {
        //         $this->output->writeln('There was a problem with the Amazon library. Error: '.$ex->getMessage());
        //         return false;
        //     }

        //     $attempt++;
        // }

        if (null == $amazonReportData) {
            throw new AmazonReportException(
                sprintf('Can get any response after %s attempts', self::MAX_REPORT_REQUEST_ATTEMPTS)
            );
        } else {
            $this->output->writeln(sprintf('Report request with ID %s was found', $reportRequestId));
        }

        try {
            $amazonReport = $this->fetchReport($amazonReportData);
            $this->output->writeln(sprintf('Report request with ID %s was loaded', $reportRequestId));
            Storage::disk('local')->put('amazon-mws/reports/' . $this->getInventoryFilename(), $amazonReport);
            $this->persistenceService->saveModelsFromFile(Order::class, storage_path('app/amazon-mws/reports/' . $this->getInventoryFilename()));
        } catch (\Exception $ex) {
            dump($ex);
            $this->output->writeln('There was a problem with the Amazon library. Error: '.$ex->getMessage());
            return false;
        }
        return true;
    }


    /**
     * @return bool|string
     * @throws \Exception;
     */
    public function sendReportRequest()
    {
        $amazonReportRequest = new AmazonReportRequest('default', false, null, $this->configFile);
        $startDate = $this->dateRange['startDate'] ? Carbon::parse($this->dateRange['startDate'])->startOfDay()->toDateTimeString(): Carbon::now()->tz('America/Los_Angeles')->subDays(1)->startOfDay()->toDateTimeString();
        $endDate = $this->dateRange['endDate'] ? Carbon::parse($this->dateRange['endDate'])->endOfDay()->toDateTimeString(): Carbon::now()->tz('America/Los_Angeles')->endOfDay()->toDateTimeString();

        $amazonReportRequest->setTimeLimits($startDate, $endDate);
        $amazonReportRequest->setReportType($this->reportType);
        $amazonReportRequest->requestReport();
        return $amazonReportRequest->getReportRequestId();
    }


    /**
     * @param int $reportRequestId
     * @return bool|string
     * @throws \Exception;
     */
    public function fetchReportList($reportRequestId)
    {
        $amazonReportList = new AmazonReportList('default', false, null, $this->configFile);
        $amazonReportList->fetchReportList();

        $amazonReport = null;
        foreach($amazonReportList->getList() as $report) {
            dump($report);
            if ($report['ReportType'] == $this->reportType) {
                if ($report['ReportRequestId'] == $reportRequestId) {
                    $amazonReport = $report;
                    break;
                } else {
                    $this->output->writeln(sprintf('Found report with another request id %s', $report['ReportRequestId']));
                }
            }
        }
        return $amazonReport;
    }


    /**
     * @param int $reportRequestId
     * @return bool|string
     * @throws \Exception;
     */
    public function fetchReportRequestList($reportRequestId)
    {
        $amazonReportRequestList = new AmazonReportRequestList('default', false, null, $this->configFile);
        $amazonReportRequestList->fetchRequestList();

        $amazonReportRequest = null;
        // dump($amazonReportRequestList->getList()); die();
        foreach($amazonReportRequestList->getList() as $reportRequest) {
            // Find this report within amazon report request list 
            if ($reportRequest['ReportType'] == $this->reportType) {
                if ($reportRequest['ReportRequestId'] == $reportRequestId && $reportRequest['ReportProcessingStatus'] == "_DONE_") {
                    $amazonReportRequest = $reportRequest;
                    break;
                } else {
                    $this->output->writeln(sprintf('Found report with another request id %s requested %s with status %s', $reportRequest['ReportRequestId'], Carbon::parse($reportRequest['SubmittedDate'])->diffForHumans(), $reportRequest['ReportProcessingStatus']));
                }
            }
        }
        if (empty($amazonReportRequest)) {
            // Find valid Report in list;
            $latestValidAmazonReportRequestSinceSent = $this->fetchLastValidReportRequest($amazonReportRequestList->getList());
            return empty($latestValidAmazonReportRequestSinceSent) ? null: $latestValidAmazonReportRequestSinceSent;
        }

        return $amazonReportRequest;
    }

    public function fetchLastValidReportRequest($reportRequestList)
    {
       $validRequestArray =  array_filter($reportRequestList, function ($reportRequest)
        {
            return $reportRequest['ReportType'] == $this->reportType && $reportRequest['ReportProcessingStatus'] == "_DONE_";
        });

       if (count($validRequestArray)) {
            $latestValidRequest = array_reduce($validRequestArray, function ($acc, $request)
            {
                return Carbon::parse($acc['SubmittedDate'])->gt(Carbon::parse($request['SubmittedDate'])) ? $acc : $request;
            }, reset($validRequestArray));
            $this->output->writeln(sprintf('Found a VALID report with another request id %s', $latestValidRequest["ReportRequestId"]));
       }
       return empty($latestValidRequest) ? null: $latestValidRequest;
    }


    /**
     * @param array $report
     * @return bool|string
     */
    public function fetchReport($report)
    {
        $reportId = !empty($report['ReportId']) ? $report['ReportId'] : $report['GeneratedReportId'];
        $amazonReport = new AmazonReport('default', $reportId, false, null, $this->configFile);
        $amazonReport->fetchReport();
        return $amazonReport->getRawReport();
    }


    /**
     * @param array $feed
     * @return array|bool
     */
    function sendInventoryFeed($feed) {
        $amz = new AmazonFeed('default', false, null, $this->configFile);
        $amz->setFeedType("_POST_INVENTORY_AVAILABILITY_DATA_"); //feed types listed in documentation
        $amz->setFeedContent($feed); //can be either XML or CSV data; a file upload method is available as well
        $amz->submitFeed(); //this is what actually sends the request
        return $amz->getResponse();
    }
}