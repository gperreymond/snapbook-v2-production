#include "marshal.hpp"

using namespace v8;

V8Result MarshalFromNative(int value)
{
	Nan::EscapableHandleScope scope;
	return scope.Escape(Nan::New<Int32>(value));
}

V8Result MarshalFromNative(unsigned int value)
{
	Nan::EscapableHandleScope scope;
	return scope.Escape(Nan::New<Uint32>(value));
}

V8Result MarshalFromNative(float value)
{
	Nan::EscapableHandleScope scope;
    return scope.Escape(Nan::New<Number>(value));
}

V8Result MarshalFromNative(double value)
{
	Nan::EscapableHandleScope scope;
	return scope.Escape(Nan::New<Number>(value));
}

V8Result MarshalFromNative(const char * value)
{
	Nan::EscapableHandleScope scope;
	return scope.Escape(Nan::New<String>(value).ToLocalChecked());
}

bool MarshalToNative(V8Result inVal, int& outVal)
{
    if (inVal->IsNumber()) {
        outVal = inVal->Int32Value();
        return true;
    }

    return false;
}

bool MarshalToNative(V8Result inVal, unsigned int& outVal)
{
    if (inVal->IsNumber()) {
        outVal = inVal->Uint32Value();
        return true;
    }

    return false;}

bool MarshalToNative(V8Result inVal, float& outVal)
{
    if (inVal->IsNumber()) {
        outVal = static_cast<float>(inVal->NumberValue());
        return true;
    }

    return false;}

bool MarshalToNative(V8Result inVal, double& outVal)
{
    if (inVal->IsNumber()) {
        outVal = inVal->NumberValue();
        return true;
    }

    return false;}