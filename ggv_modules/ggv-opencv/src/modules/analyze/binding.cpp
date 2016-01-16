#include <cloudcv.hpp>
#include "modules/analyze/analyze.hpp"

#include <framework/marshal/marshal.hpp>
#include <framework/NanCheck.hpp>
#include "framework/Job.hpp"
#include "framework/ImageSource.hpp"

#include <vector>

using namespace v8;
using namespace node;
using namespace cloudcv;

namespace cloudcv
{
    V8Result MarshalFromNative(const Distribution& d);
    V8Result MarshalFromNative(const DominantColor& d);
    V8Result MarshalFromNative(const RGBDistribution& d);
    V8Result MarshalFromNative(const AnalyzeResult& res);
}

#include <framework/marshal/node_object_builder.hpp>
#include <framework/Logger.h>

namespace cloudcv
{
    class ImageAnalyzeTask : public Job
    {
    public:

        ImageAnalyzeTask(ImageSourcePtr image, Nan::Callback * callback)
            : Job(callback)
            , m_imageSource(image)
        {
            TRACE_FUNCTION;
        }

        virtual ~ImageAnalyzeTask()
        {
            TRACE_FUNCTION;
        }

    protected:

        // This function is executed in another thread at some point after it has been
        // scheduled. IT MUST NOT USE ANY V8 FUNCTIONALITY. Otherwise your extension
        // will crash randomly and you'll have a lot of fun debugging.
        // If you want to use parameters passed into the original call, you have to
        // convert them to PODs or some other fancy method.
        virtual void ExecuteNativeCode()
        {
            TRACE_FUNCTION;
            cv::Mat image = m_imageSource->getImage();

            if (image.empty())
            {
                SetErrorMessage("Cannot decode image");
                return;
            }

            AnalyzeImage(image, m_analyzeResult);
        }

        // This function is executed in the main V8/JavaScript thread. That means it's
        // safe to use V8 functions again. Don't forget the HandleScope!
        virtual Local<Value> CreateCallbackResult()
        {
            TRACE_FUNCTION;
            Nan::EscapableHandleScope scope;
            return scope.Escape(MarshalFromNative(m_analyzeResult));
        }

    private:
        ImageSourcePtr m_imageSource;
        AnalyzeResult  m_analyzeResult;
    };

    NAN_METHOD(analyzeImage)
    {
        TRACE_FUNCTION;
        Nan::EscapableHandleScope scope;

        Local<Object> imageBuffer;
        std::string   imageFile;
        Local<Function> imageCallback;
        std::string     error;

        if (NanCheck(info)
            .Error(&error)
            .ArgumentsCount(2)
            .Argument(0).IsBuffer().Bind(imageBuffer)
            .Argument(1).IsFunction().Bind(imageCallback))
        {
            Nan::Callback *callback = new Nan::Callback(imageCallback);
            Nan::AsyncQueueWorker(new ImageAnalyzeTask(CreateImageSource(imageBuffer), callback));
            return;
        }
        else if (NanCheck(info)
            .Error(&error)
            .ArgumentsCount(2)
            .Argument(0).IsString().Bind(imageFile)
            .Argument(1).IsFunction().Bind(imageCallback))
        {
            Nan::Callback *callback = new Nan::Callback(imageCallback);
            Nan::AsyncQueueWorker(new ImageAnalyzeTask(CreateImageSource(imageFile), callback));
            return;
        }
        else if (!error.empty())
        {
            Nan::ThrowTypeError(error.c_str());
        }

        return;
    }

    V8Result MarshalFromNative(const Distribution& d)
    {
        TRACE_FUNCTION;
        Nan::EscapableHandleScope scope;

        Local<Object> structure = Nan::New<Object>();
        NodeObject resultWrapper(structure);

        resultWrapper["average"] = d.average;
        resultWrapper["entropy"] = d.entropy;
        resultWrapper["max"] = d.max;
        resultWrapper["min"] = d.min;
        resultWrapper["standardDeviation"] = d.standardDeviation;

        return scope.Escape(structure);
    }

    V8Result MarshalFromNative(const DominantColor& d)
    {
        TRACE_FUNCTION;
        Nan::EscapableHandleScope scope;

        Local<Object> structure = Nan::New<Object>();
        NodeObject resultWrapper(structure);

        resultWrapper["average"] = d.color;
        resultWrapper["entropy"] = d.error;
        resultWrapper["max"] = d.interclassVariance;
        resultWrapper["min"] = d.totalPixels;
        resultWrapper["html"] = d.html();

        return scope.Escape(structure);
    }

    V8Result MarshalFromNative(const RGBDistribution& d)
    {
        TRACE_FUNCTION;
        Nan::EscapableHandleScope scope;

        Local<Object> structure = Nan::New<Object>();
        NodeObject resultWrapper(structure);

        resultWrapper["b"] = d.b;
        resultWrapper["g"] = d.g;
        resultWrapper["r"] = d.r;

        return scope.Escape(structure);
    }

    V8Result MarshalFromNative(const AnalyzeResult& res)
    {
        TRACE_FUNCTION;
        Nan::EscapableHandleScope scope;

        Local<Object> structure = Nan::New<Object>();
        NodeObject resultWrapper(structure);

        resultWrapper["aspectRatio"] = res.aspectRatio;
        resultWrapper["colorDeviation"] = res.colorDeviation;
        resultWrapper["dominantColors"] = res.dominantColors;
        resultWrapper["frameSize"] = res.frameSize;
        resultWrapper["histogram"] = res.histogram;
        resultWrapper["intensity"] = res.intensity;
        resultWrapper["reducedColors"] = res.reducedColors;
        resultWrapper["rmsContrast"] = res.rmsContrast;
        resultWrapper["uniqueColors"] = res.uniqieColors;

        return scope.Escape(structure);
    }
}