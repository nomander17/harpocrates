import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { API_URL } from "../config";
import "./Secrets.css";
import {
  hexToUint8Array,
  getEncryptionKey,
  decryptText,
} from "../utils/crypto.js";

const Secrets = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSecrets = useCallback(async () => {
    setIsLoading(true);
    const key = await getEncryptionKey();
    if (!key) {
      toast.error("Session expired or invalid. Please log in again.");
      navigate("/");
      return;
    }

    try {
      // fetch all metadata
      const metadataRes = await fetch(`${API_URL}/api/secrets/metadata`, {
        credentials: "include",
      });
      if (!metadataRes.ok) {
        if (metadataRes.status === 401) {
          toast.error("Unauthorized. Please log in again.");
          navigate("/");
          return;
        }
        throw new Error("Failed to fetch secrets metadata");
      }
      const metadata = await metadataRes.json();

      // fetch and decrypt full content for each note
      const decryptedNotes = await Promise.all(
        metadata.map(async (note) => {
          try {
            const title = await decryptText(
              hexToUint8Array(note.title_encrypted),
              hexToUint8Array(note.iv_title),
              key
            );

            const noteRes = await fetch(`${API_URL}/api/secrets/${note.id}`, {
              credentials: "include",
            });
            if (!noteRes.ok) throw new Error(`Failed to fetch note ${note.id}`);
            const { body_encrypted, iv_body } = await noteRes.json();

            const content = await decryptText(
              hexToUint8Array(body_encrypted),
              hexToUint8Array(iv_body),
              key
            );

            return { ...note, title, content };
          } catch (err) {
            console.error(`Failed to process note ${note.id}:`, err);
            // return a note with an error message
            return {
              ...note,
              title: "Error",
              content: "Could not decrypt this note.",
            };
          }
        })
      );

      setNotes(decryptedNotes);
    } catch (error) {
      console.error(error);
      toast.error("Could not load your secrets.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      sessionStorage.clear();
      toast.success("Logged out successfully.");
      navigate("/");
    }
  };

  return (
    <div id="app-container">
      <div id="header">
        <h1>Crates</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your secrets...</p>
        </div>
      ) : (
        <div className="notes-container">
          {notes.length === 0 ? (
            <div className="empty-state">
              <h2>No secrets yet!</h2>
              <p>You can create secrets via the API.</p>
            </div>
          ) : (
            <div className="notes">
              {notes.map((note) => (
                <div key={note.id} className="note">
                  <div className="note-header">
                    <h3 className="note-title">{note.title}</h3>
                  </div>
                  <div className="note-content">
                    <p>{note.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Secrets;