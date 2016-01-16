#include "marshal.hpp"
#include "node_object_builder.hpp"
#include "framework/Image.hpp"
#include "framework/Logger.h"

using namespace v8;

V8Result MarshalFromNative(const cv::Size& value)
{
	Nan::EscapableHandleScope scope;
	Local<Object> structure = Nan::New<Object>();
	structure->Set(Nan::New<String>("width").ToLocalChecked(),    MarshalFromNative(value.width));
	structure->Set(Nan::New<String>("height").ToLocalChecked(),   MarshalFromNative(value.height));
	return scope.Escape(structure);
}

V8Result MarshalFromNative(const cv::Rect& value)
{
	Nan::EscapableHandleScope scope;
	Local<Object> structure = Nan::New<Object>();
	structure->Set(Nan::New<String>("x").ToLocalChecked(),        MarshalFromNative(value.x));
	structure->Set(Nan::New<String>("y").ToLocalChecked(),        MarshalFromNative(value.y));
	structure->Set(Nan::New<String>("width").ToLocalChecked(),    MarshalFromNative(value.width));
	structure->Set(Nan::New<String>("height").ToLocalChecked(),   MarshalFromNative(value.height));
	return scope.Escape(structure);
}

V8Result MarshalFromNative(const cv::Point& value)
{
	Nan::EscapableHandleScope scope;
	Local<Object> structure = Nan::New<Object>();
	structure->Set(Nan::New<String>("x").ToLocalChecked(), MarshalFromNative(value.x));
	structure->Set(Nan::New<String>("y").ToLocalChecked(), MarshalFromNative(value.y));
	return scope.Escape(structure);
}

V8Result MarshalFromNative(const cv::Point2f& value)
{
	Nan::EscapableHandleScope scope;
	Local<Object> structure = Nan::New<Object>();
	structure->Set(Nan::New<String>("x").ToLocalChecked(), MarshalFromNative(value.x));
	structure->Set(Nan::New<String>("y").ToLocalChecked(), MarshalFromNative(value.y));
	return scope.Escape(structure);
}

V8Result MarshalFromNative(const cv::Matx33f& value)
{
    Nan::EscapableHandleScope scope;
    Handle<Array> result = Nan::New<Array>(9);
    
    result->Set(0, MarshalFromNative( value(0,0) ));
    result->Set(1, MarshalFromNative( value(0,1) ));
    result->Set(2, MarshalFromNative( value(0,2) ));

    result->Set(3, MarshalFromNative( value(1,0) ));
    result->Set(4, MarshalFromNative( value(1,1) ));
    result->Set(5, MarshalFromNative( value(1,2) ));

    result->Set(6, MarshalFromNative( value(2,0) ));
    result->Set(7, MarshalFromNative( value(2,1) ));
    result->Set(8, MarshalFromNative( value(2,2) ));

    return scope.Escape(result);
}

V8Result MarshalFromNative(const cv::Scalar& value)
{
    Nan::EscapableHandleScope scope;
    Local<Array> result = Nan::New<Array>(4);

	for (size_t i = 0; i < 4; i++) 
	{
		result->Set(i, MarshalFromNative(value.val[i]));
	}

	return scope.Escape(result);
}

V8Result MarshalFromNative(const cv::Mat& value)
{
    Nan::EscapableHandleScope scope;
    return scope.Escape(cloudcv::ImageView::ViewForImage(value));
}

bool MarshalToNativeImage(V8Result imageBuffer, cv::Mat& frame, int flags)
{
	char * bufferData = node::Buffer::Data(imageBuffer);
	size_t bufferLength = node::Buffer::Length(imageBuffer);
	std::vector<char> imageData(bufferData, bufferData + bufferLength);

	frame = cv::imdecode(imageData, flags, &frame);

	return false == frame.empty();
}

bool MarshalToNative(V8Result obj, cv::Point2f& value)
{
    TRACE_FUNCTION;
    
    if (!obj->IsObject())
        return false;

    const Handle<v8::Object>& object = obj.As<v8::Object>();

    if (object->HasOwnProperty(Nan::New<String>("x").ToLocalChecked()) && 
        object->HasOwnProperty(Nan::New<String>("y").ToLocalChecked())) {
        value.x = static_cast<float>(object->Get(Nan::New<String>("x").ToLocalChecked())->NumberValue());
        value.y = static_cast<float>(object->Get(Nan::New<String>("y").ToLocalChecked())->NumberValue());
        return true;
    }

    return false;
}

bool MarshalToNative(V8Result obj, cv::Size& value)
{
    TRACE_FUNCTION;

    if (!obj->IsObject())
        return false;

    const Handle<v8::Object>& object = obj.As<v8::Object>();

    if (object->HasOwnProperty(Nan::New<String>("width").ToLocalChecked()) && 
        object->HasOwnProperty(Nan::New<String>("height").ToLocalChecked())) {
        value.width  = static_cast<float>(object->Get(Nan::New<String>("width").ToLocalChecked())->NumberValue());
        value.height = static_cast<float>(object->Get(Nan::New<String>("height").ToLocalChecked())->NumberValue());
        return true;
    }

    return false;
}

