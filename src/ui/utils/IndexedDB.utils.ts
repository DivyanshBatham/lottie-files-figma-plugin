class IndexedDBUtils {
  private DB_NAME: string;
  private STORE_NAME: string;
  private db: IDBDatabase | null;

  constructor(dbName: string, storeName: string) {
    this.DB_NAME = dbName;
    this.STORE_NAME = storeName;
    this.db = null;
  }

  private async openDB(): Promise<IDBDatabase> {
    return new Promise<IDBDatabase>((resolve, reject) => {
      if (this.db) {
        resolve(this.db);
        return;
      }

      if ("indexedDB" in window) {
        const request = window.indexedDB.open(this.DB_NAME, 1);

        request.onupgradeneeded = (event) => {
          this.db = (event.target as IDBOpenDBRequest).result;
          this.db.createObjectStore(this.STORE_NAME, { keyPath: "jsonUrl" });
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db!);
        };

        request.onerror = (event) => {
          reject((event.target as IDBOpenDBRequest).error);
        };
      } else {
        console.error("IndexedDB is not supported in this browser.");
      }
    });
  }

  public async saveToIndexedDB(jsonUrl: string, data: any): Promise<void> {
    try {
      const database = await this.openDB();
      const transaction = database.transaction(this.STORE_NAME, "readwrite");
      const store = transaction.objectStore(this.STORE_NAME);

      store.put({ jsonUrl, data });

      transaction.oncomplete = () => {
        // No need to close the database explicitly
      };
    } catch (error) {
      console.error("Error saving to IndexedDB:", error);
    }
  }

  public async getFromIndexedDB(jsonUrl: string): Promise<any | null> {
    try {
      const database = await this.openDB();
      const transaction = database.transaction(this.STORE_NAME, "readonly");
      const store = transaction.objectStore(this.STORE_NAME);

      const request = store.get(jsonUrl);

      return new Promise<any | null>((resolve, reject) => {
        request.onsuccess = () => {
          const data = request.result ? request.result.data : null;
          resolve(data);
        };

        request.onerror = (event) => {
          reject((event.target as IDBRequest).error);
        };
      });
    } catch (error) {
      console.error("Error getting from IndexedDB:", error);
      return null;
    }
  }
}

export default IndexedDBUtils;
