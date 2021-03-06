#pragma once

#include <stdlib.h>
#include <opencv2/opencv.hpp>
#include <nan.h>


namespace cloudcv
{
    /**
     * @brief A wrapper around cv::Mat type that is returned in callbacks to Node.js.
     * @details This class provide basic methods to get image dimension and type, but 
     *          it's goal to allow 'export' binary data to Jpg/Png/Webp/Json formats.
     */
	class ImageView : public Nan::ObjectWrap
    {
    public:
        explicit ImageView(const cv::Mat& image);
        ~ImageView() {}
    
        static NAN_METHOD(New);

        static void Init(v8::Handle<v8::Object> exports);
        static v8::Local<v8::Value> ViewForImage(cv::Mat image);

        static Nan::Persistent<v8::FunctionTemplate> constructor;
    private:
        
        static NAN_METHOD(Thumbnail);

        static NAN_METHOD(AsJpegStream);
        static NAN_METHOD(AsJpegDataUri);

        static NAN_METHOD(AsPngStream);
        static NAN_METHOD(AsPngDataUri);

        static NAN_METHOD(AsObject);

        static NAN_METHOD(Width);
        static NAN_METHOD(Height);
        static NAN_METHOD(Channels);
        static NAN_METHOD(Type);
        static NAN_METHOD(Stride);
        
        ////////////////////////////////////////
        // team-ggv
        ////////////////////////////////////////
        static NAN_METHOD(Compare);
        static NAN_METHOD(Compute);
        static NAN_METHOD(Prepare);
        static NAN_METHOD(Keypoints);
        static NAN_METHOD(Descriptors);
        ////////////////////////////////////////

    private:
        cv::Mat mImage;    
        
        ////////////////////////////////////////
        // team-ggv
        ////////////////////////////////////////
        std::vector<cv::KeyPoint> mKeypoints;
	    cv::Mat mDescriptors;
	    ////////////////////////////////////////
    };

    NAN_METHOD(loadImage); // Accessible via cloucv.loadImage
}

