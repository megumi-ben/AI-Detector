import { Tabs } from 'expo-router';

import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';



export default function TabLayout() {
return (
  <Tabs
  screenOptions={{
    tabBarActiveTintColor: '#4F46E5',
    headerStyle: {
      backgroundColor: '#25292e',
    },
    // headerTitleStyle: {
    //   fontWeight: 'bold',
    // },
    headerShadowVisible: false,
    headerTintColor: '#fff',
    tabBarStyle: {
    backgroundColor: '#25292e',
    // height: 60
    },
    tabBarLabelStyle:{
      fontSize:12
    },
  }}
>
    <Tabs.Screen
      name="index"
      options={{
        title: 'Home',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
        ),
      }}
    />
    <Tabs.Screen
      name="photoDetect"
      options={{
        title: 'Photo',
        tabBarIcon: ({ color, focused }) => (
          <FontAwesome name="photo" size={24} color={color}/>
        ),
      }}
    />
    <Tabs.Screen
      name="videoDetect"
      options={{
        title: 'Video',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'videocam' : 'videocam-outline'} color={color} size={30} />
        ),
      }}
    />
    <Tabs.Screen
      name="textDetect"
      options={{
        title: 'Text',
        tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'document-text' : 'document-text-outline'} color={color} size={26} />
        ),
      }}
    />
    <Tabs.Screen
      name="fileDetect"
      options={{
        title: 'File',
        tabBarIcon: ({ color, focused }) => (
          <FontAwesome name={focused ? 'folder-open' : 'folder-open-o'} color={color} size={24} />
        ),
      }}
    />
    {/* <Tabs.Screen
      name="trial"
      options={{
        title: 'Tools',
        tabBarIcon: ({ color, focused }) => (
          <MaterialCommunityIcons name={focused ? 'toolbox' : 'toolbox-outline'} color={color} size={26} />
        ),
      }}
    /> */}
    {/* <Tabs.Screen
      name="trial2"
      options={{
        title: 'Trial2',
        tabBarIcon: ({ color, focused }) => (
          <Entypo name="text" color={color} size={24} />
        ),
      }}
    /> */}
  </Tabs>
);
}



