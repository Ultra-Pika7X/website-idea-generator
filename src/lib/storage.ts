import { openDB, DBSchema } from 'idb';
import { Idea } from './ideaEngine';
import { auth, db, provider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore';

interface IdeasDB extends DBSchema {
    ideas: {
        key: string;
        value: Idea;
        indexes: { 'by-date': number };
    };
}

const DB_NAME = 'website-idea-generator';
const STORE_NAME = 'ideas';

// --- Local Storage (IDB) ---

export async function initDB() {
    return openDB<IdeasDB>(DB_NAME, 1, {
        upgrade(db) {
            const store = db.createObjectStore(STORE_NAME, {
                keyPath: 'id',
            });
            store.createIndex('by-date', 'createdAt');
        },
    });
}

// --- Auth Helpers ---

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        // Sync local ideas to cloud on login
        await syncLocalToCloud(result.user);
        return result.user;
    } catch (error) {
        console.error("Login failed", error);
        throw error;
    }
};

export const logout = async () => {
    await signOut(auth);
};

// --- Sync Logic ---

const syncLocalToCloud = async (user: User) => {
    const localIdeas = await getAllIdeasLocal();
    if (localIdeas.length === 0) return;

    // Upload all local ideas to Firestore
    const batchPromises = localIdeas.map(idea =>
        setDoc(doc(db, `users/${user.uid}/ideas`, idea.id), idea)
    );
    await Promise.all(batchPromises);
    // Optional: Clear local DB after sync or keep as cache?
    // For now, we keep them.
};

// --- CRUD Operations ---

export async function saveIdea(idea: Idea) {
    // Always save local (fast UI)
    const dbLocal = await initDB();
    await dbLocal.put(STORE_NAME, idea);

    // If logged in, save to cloud
    if (auth && auth.currentUser) {
        await setDoc(doc(db, `users/${auth.currentUser.uid}/ideas`, idea.id), idea);
    }
}

export async function getAllIdeasLocal() {
    const db = await initDB();
    return db.getAllFromIndex(STORE_NAME, 'by-date');
}

export async function getAllIdeas(): Promise<Idea[]> {
    // If logged in, fetch from Cloud (Source of Truth)
    if (auth && auth.currentUser) {
        try {
            const querySnapshot = await getDocs(collection(db, `users/${auth.currentUser.uid}/ideas`));
            const cloudIdeas: Idea[] = [];
            querySnapshot.forEach((doc) => {
                cloudIdeas.push(doc.data() as Idea);
            });
            // Merge/Sort
            return cloudIdeas.sort((a, b) => b.createdAt - a.createdAt);
        } catch (e) {
            console.error("Error fetching from cloud", e);
            return getAllIdeasLocal(); // Fallback
        }
    }
    return getAllIdeasLocal();
}

export async function updateIdea(idea: Idea) {
    const dbLocal = await initDB();
    await dbLocal.put(STORE_NAME, idea);

    if (auth.currentUser) {
        await setDoc(doc(db, `users/${auth.currentUser.uid}/ideas`, idea.id), idea);
    }
}

export async function deleteIdea(id: string) {
    const dbLocal = await initDB();
    await dbLocal.delete(STORE_NAME, id);

    if (auth.currentUser) {
        await deleteDoc(doc(db, `users/${auth.currentUser.uid}/ideas`, id));
    }
}

