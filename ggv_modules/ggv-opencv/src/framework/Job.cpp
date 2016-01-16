#include "Job.hpp"
#include <stdexcept>
#include <iostream>
#include "framework/Logger.h"

namespace cloudcv {

	Job::Job(Nan::Callback *callback)
		: Nan::AsyncWorker(callback)
    {
    }

    Job::~Job()
    {
    }

    void Job::Execute()
    {
        try
        {
            ExecuteNativeCode();
        }
	catch (cv::Exception& exc)
	{
	    SetErrorMessage(exc.what());
	}
        catch (std::runtime_error& e)
        {
            SetErrorMessage(e.what());
        }
    }

	void Job::HandleOKCallback()
	{
		Nan::EscapableHandleScope scope;

		v8::Local<v8::Value> argv[] = {
			Nan::Null(),
			CreateCallbackResult()
		};

		callback->Call(2, argv);
	}

    void Job::SetErrorMessage(const std::string& errorMessage)
    {
        LOG_TRACE_MESSAGE("Error message:" << errorMessage);
        
        Nan::AsyncWorker::SetErrorMessage(errorMessage.c_str());
    }        
}
