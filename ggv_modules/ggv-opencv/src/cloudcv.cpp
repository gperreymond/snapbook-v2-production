#include <node.h>
#include <v8.h>

#include "framework/Image.hpp"
#include "cloudcv.hpp"

using namespace v8;
using namespace node;
using namespace cloudcv;

void RegisterModule(Handle<Object> target)
{
    Nan::SetMethod(target, "version",                  version);
    Nan::SetMethod(target, "buildInformation",         buildInformation);
    Nan::SetMethod(target, "analyzeImage",             analyzeImage);
    Nan::SetMethod(target, "calibrationPatternDetect", calibrationPatternDetect);
    Nan::SetMethod(target, "calibrateCamera",          calibrateCamera);
    Nan::SetMethod(target, "loadImage",                loadImage);

    ImageView::Init(target);
}

NODE_MODULE(cloudcv, RegisterModule);
