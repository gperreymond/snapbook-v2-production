cmd_Release/obj.target/cloudcv.node := g++ -shared -pthread -rdynamic -m64  -Wl,-soname=cloudcv.node -o Release/obj.target/cloudcv.node -Wl,--start-group Release/obj.target/cloudcv/src/cloudcv.o Release/obj.target/cloudcv/src/framework/marshal/marshal.o Release/obj.target/cloudcv/src/framework/marshal/stl.o Release/obj.target/cloudcv/src/framework/marshal/opencv.o Release/obj.target/cloudcv/src/framework/marshal/primitives.o Release/obj.target/cloudcv/src/framework/marshal/node_object_builder.o Release/obj.target/cloudcv/src/framework/Image.o Release/obj.target/cloudcv/src/framework/ImageSource.o Release/obj.target/cloudcv/src/framework/Job.o Release/obj.target/cloudcv/src/framework/Async.o Release/obj.target/cloudcv/src/framework/NanCheck.o Release/obj.target/cloudcv/src/modules/common/Numeric.o Release/obj.target/cloudcv/src/modules/common/ImageUtils.o Release/obj.target/cloudcv/src/modules/analyze/analyze.o Release/obj.target/cloudcv/src/modules/analyze/binding.o Release/obj.target/cloudcv/src/modules/analyze/dominantColors.o Release/obj.target/cloudcv/src/modules/buildInformation/buildInformation.o Release/obj.target/cloudcv/src/modules/cameraCalibration/CameraCalibrationBinding.o Release/obj.target/cloudcv/src/modules/cameraCalibration/CameraCalibrationAlgorithm.o -Wl,--end-group /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_calib3d.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_core.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_features2d.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_flann.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_highgui.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_imgcodecs.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_imgproc.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_ml.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_objdetect.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_photo.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_shape.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_stitching.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_superres.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_ts.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_video.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_videoio.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/lib/libopencv_videostab.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/share/OpenCV/3rdparty/lib/libippicv.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/share/OpenCV/3rdparty/lib/liblibjpeg.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/share/OpenCV/3rdparty/lib/liblibpng.a /home/ubuntu/workspace/git/abibao/snapbook-v1-production/ggv_modules/ggv-opencv/node_modules/native-opencv/opencv/share/OpenCV/3rdparty/lib/libzlib.a