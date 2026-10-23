# SmartEMS Driver

`package.json` here is a placeholder on purpose (Expo SDK versions change fast).
Generate the real project once, then keep this `src/` folder:

```bash
npx create-expo-app@latest tmp-app
cp -r tmp-app/* tmp-app/.gitignore . && rm -rf tmp-app   # then merge package.json/app.json if prompted
npm install @react-navigation/native @react-navigation/native-stack zustand
npx expo install react-native-maps expo-location
```
