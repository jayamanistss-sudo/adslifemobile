if(NOT TARGET react-native-worklets::worklets)
add_library(react-native-worklets::worklets SHARED IMPORTED)
set_target_properties(react-native-worklets::worklets PROPERTIES
    IMPORTED_LOCATION "/home/ptl024/Desktop/msj/ads/AdsLifeApp/node_modules/react-native-worklets/android/build/intermediates/cxx/RelWithDebInfo/5o2r2s2v/obj/x86/libworklets.so"
    INTERFACE_INCLUDE_DIRECTORIES "/home/ptl024/Desktop/msj/ads/AdsLifeApp/node_modules/react-native-worklets/android/build/prefab-headers/worklets"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

