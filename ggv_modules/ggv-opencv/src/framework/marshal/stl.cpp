#include "marshal.hpp"
#include "framework/Logger.h"
using namespace v8;

V8Result MarshalFromNative(const std::string& value)
{
	Nan::EscapableHandleScope scope;
	return scope.Escape( Nan::New<String>((char*)value.data(), value.size()).ToLocalChecked() );
}

bool MarshalToNative(V8Result inVal, std::string& outVal)
{
    TRACE_FUNCTION;
    
    if (inVal->IsString()) {
        Nan::Utf8String cStr(inVal);
        outVal = std::string(*cStr, cStr.length());
        return true;
    }

    return false;
}