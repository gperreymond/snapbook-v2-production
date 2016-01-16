#include <cloudcv.hpp>
#include <framework/marshal/marshal.hpp>

namespace cloudcv 
{
    NAN_METHOD(version)
    {
        Nan::HandleScope scope;
        std::string versionString = lexical_cast(CV_MAJOR_VERSION) + "." + lexical_cast(CV_MINOR_VERSION);
        info.GetReturnValue().Set(MarshalFromNative(versionString));
    }

	NAN_METHOD(buildInformation)
    {
		Nan::EscapableHandleScope scope;
		info.GetReturnValue().Set(MarshalFromNative(cv::getBuildInformation()));
    }
}