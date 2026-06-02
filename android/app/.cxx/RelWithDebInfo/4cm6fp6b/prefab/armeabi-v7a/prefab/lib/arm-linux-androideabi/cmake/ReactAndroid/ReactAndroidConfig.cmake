if(NOT TARGET ReactAndroid::hermestooling)
add_library(ReactAndroid::hermestooling SHARED IMPORTED)
set_target_properties(ReactAndroid::hermestooling PROPERTIES
    IMPORTED_LOCATION "/home/ptl024/.gradle/caches/9.3.1/transforms/1a811400cc0489cd26373fbd36604dfc/transformed/react-android-0.85.3-release/prefab/modules/hermestooling/libs/android.armeabi-v7a/libhermestooling.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/ptl024/.gradle/caches/9.3.1/transforms/1a811400cc0489cd26373fbd36604dfc/transformed/react-android-0.85.3-release/prefab/modules/hermestooling/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::jsi)
add_library(ReactAndroid::jsi SHARED IMPORTED)
set_target_properties(ReactAndroid::jsi PROPERTIES
    IMPORTED_LOCATION "/home/ptl024/.gradle/caches/9.3.1/transforms/1a811400cc0489cd26373fbd36604dfc/transformed/react-android-0.85.3-release/prefab/modules/jsi/libs/android.armeabi-v7a/libjsi.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/ptl024/.gradle/caches/9.3.1/transforms/1a811400cc0489cd26373fbd36604dfc/transformed/react-android-0.85.3-release/prefab/modules/jsi/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

if(NOT TARGET ReactAndroid::reactnative)
add_library(ReactAndroid::reactnative SHARED IMPORTED)
set_target_properties(ReactAndroid::reactnative PROPERTIES
    IMPORTED_LOCATION "/home/ptl024/.gradle/caches/9.3.1/transforms/1a811400cc0489cd26373fbd36604dfc/transformed/react-android-0.85.3-release/prefab/modules/reactnative/libs/android.armeabi-v7a/libreactnative.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/ptl024/.gradle/caches/9.3.1/transforms/1a811400cc0489cd26373fbd36604dfc/transformed/react-android-0.85.3-release/prefab/modules/reactnative/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

