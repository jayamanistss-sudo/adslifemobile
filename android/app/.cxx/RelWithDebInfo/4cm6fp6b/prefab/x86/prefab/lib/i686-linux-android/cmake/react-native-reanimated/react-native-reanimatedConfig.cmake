if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "/home/ptl024/Desktop/msj/ads/AdsLifeApp/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/4p142k5m/obj/x86/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/ptl024/Desktop/msj/ads/AdsLifeApp/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

