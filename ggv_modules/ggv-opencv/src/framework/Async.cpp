#include "framework/Async.hpp"
#include "framework/Job.hpp"
#include "framework/Logger.h"

namespace cloudcv
{
    
    class AsyncTask : public Job
    {
    public:
        AsyncTask(AsyncLambdaFunction task, Nan::Callback * callback)
            : Job(callback)
            , mTask(task)
            , mReturnResult([](){ Nan::EscapableHandleScope scope; return scope.Escape(Nan::Null()); })
        {
        }

        virtual ~AsyncTask()
        {

        }

    protected:

        virtual v8::Local<v8::Value> CreateCallbackResult()
        {
            TRACE_FUNCTION;
            Nan::EscapableHandleScope scope;
            return scope.Escape(mReturnResult());
        }

        virtual void ExecuteNativeCode()
        {
            TRACE_FUNCTION;
            AsyncErrorFunction errorResult = [this](const char * msg) {
                SetErrorMessage(msg);
            };

            AsyncReturnHelper returnResult(mReturnResult);
            mTask(returnResult, errorResult);
        }
    private:
        AsyncLambdaFunction                     mTask;
        std::function<v8::Local<v8::Value>()>   mReturnResult;
    };


    void Async(AsyncLambdaFunction task, Nan::Callback * callback)
    {
        TRACE_FUNCTION;
        Nan::AsyncQueueWorker(new AsyncTask(task, callback));
    }   
}