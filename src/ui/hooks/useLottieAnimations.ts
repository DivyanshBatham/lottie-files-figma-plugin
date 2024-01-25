// useLottieAnimations.ts
import { useState, useEffect } from "react";
import IndexedDBUtils from "../utils/IndexedDB.utils";

const useLottieAnimations = (jsonUrls: { id: number; jsonUrl: string }[]) => {
  const [animationDataMap, setAnimationDataMap] = useState<{
    [key: number]: any;
  }>({});

  const indexedDBUtils = new IndexedDBUtils(
    "LottieFilesAEPulgin",
    "LottieAnimationsData"
  );

  useEffect(() => {
    const fetchAndCacheAnimationData = async (id: number, jsonUrl: string) => {
      try {
        const cachedData = await indexedDBUtils.getFromIndexedDB(jsonUrl);

        if (cachedData) {
          console.log(`Found data of ${id} in cache`);
          setAnimationDataMap((prevAnimationDataMap) => ({
            ...prevAnimationDataMap,
            [id]: cachedData,
          }));
        } else {
          const response = await fetch(jsonUrl);
          const data = await response.json();
          await indexedDBUtils.saveToIndexedDB(jsonUrl, data);
          setAnimationDataMap((prevAnimationDataMap) => ({
            ...prevAnimationDataMap,
            [id]: data,
          }));
        }
      } catch (error) {
        console.error("Error fetching or caching animation data:", error);
      }
    };

    const fetchAnimationDataList = async () => {
      try {
        const promises = jsonUrls.map(({ id, jsonUrl }) =>
          fetchAndCacheAnimationData(id, jsonUrl)
        );

        await Promise.all(promises);
      } catch (error) {
        console.error("Error fetching or caching animation data list:", error);
      }
    };

    fetchAnimationDataList();
  }, [jsonUrls]);

  return animationDataMap;
};

export default useLottieAnimations;
