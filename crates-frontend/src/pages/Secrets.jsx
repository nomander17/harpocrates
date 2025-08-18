import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Fish, X } from "lucide-react";
import { toast } from "sonner";
import { API_URL } from "../config";
import "./../App.css";
import "./Secrets.css";
import {
  hexToUint8Array,
  getEncryptionKey,
  decryptText,
  encryptText,
} from "../utils/crypto.js";

const Secrets = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [isSaving, setIsSaving] = useState(false);
  const observerRef = useRef();
  const loadMoreTriggerRef = useRef();
  const modalRef = useRef();
  const titleInputRef = useRef();

  const LIMIT = 50;

  const fetchSecrets = useCallback(
    async (currentOffset = 0, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const key = await getEncryptionKey();
      if (!key) {
        toast.error("Session expired or invalid. Please log in again.");
        navigate("/");
        return;
      }

      try {
        // Fetch metadata only
        const metadataRes = await fetch(
          `${API_URL}/api/secrets/metadata?limit=${LIMIT}&offset=${currentOffset}`,
          {
            credentials: "include",
          }
        );

        if (!metadataRes.ok) {
          if (metadataRes.status === 401) {
            toast.error("Unauthorized. Please log in again.");
            navigate("/");
            return;
          }
          throw new Error("Failed to fetch secrets metadata");
        }

        const metadata = await metadataRes.json();

        if (metadata.length < LIMIT) {
          setHasMore(false);
        }

        // Decrypt titles and prepare notes with placeholder content
        const notesWithTitles = await Promise.all(
          metadata.map(async (note) => {
            try {
              const title = await decryptText(
                hexToUint8Array(note.title_encrypted),
                hexToUint8Array(note.iv_title),
                key
              );

              return {
                ...note,
                title,
                content: null, // Will be decrypted when visible
                isContentDecrypted: false,
                isDecrypting: false,
              };
            } catch (err) {
              console.error(
                `Failed to decrypt title for note ${note.id}:`,
                err
              );
              return {
                ...note,
                title: "Error decrypting title",
                content: null,
                isContentDecrypted: false,
                isDecrypting: false,
              };
            }
          })
        );

        if (append) {
          setNotes((prev) => [...prev, ...notesWithTitles]);
        } else {
          setNotes(notesWithTitles);
        }

        setOffset(currentOffset + LIMIT);
      } catch (error) {
        console.error(error);
        toast.error("Could not load your secrets.");
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [navigate]
  );

  const decryptNoteContent = useCallback(async (noteId) => {
    const key = await getEncryptionKey();
    if (!key) return;

    // Mark as decrypting
    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId ? { ...note, isDecrypting: true } : note
      )
    );

    try {
      const noteRes = await fetch(`${API_URL}/api/secrets/${noteId}`, {
        credentials: "include",
      });

      if (!noteRes.ok) {
        throw new Error(`Failed to fetch note ${noteId}`);
      }

      const { body_encrypted, iv_body } = await noteRes.json();

      const content = await decryptText(
        hexToUint8Array(body_encrypted),
        hexToUint8Array(iv_body),
        key
      );

      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? {
                ...note,
                content,
                isContentDecrypted: true,
                isDecrypting: false,
              }
            : note
        )
      );
    } catch (err) {
      console.error(`Failed to decrypt content for note ${noteId}:`, err);
      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? {
                ...note,
                content: "Error decrypting content",
                isContentDecrypted: true,
                isDecrypting: false,
              }
            : note
        )
      );
    }
  }, []);

  // Intersection observer for content decryption
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const noteId = entry.target.dataset.noteId;
            const note = notes.find((n) => n.id === noteId);

            if (note && !note.isContentDecrypted && !note.isDecrypting) {
              decryptNoteContent(noteId);
            }
          }
        });
      },
      {
        rootMargin: "100px", // Start decrypting when note is 100px away from viewport
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [notes, decryptNoteContent]);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoading
        ) {
          fetchSecrets(offset, true);
        }
      },
      { rootMargin: "100px" }
    );

    if (loadMoreTriggerRef.current) {
      loadMoreObserver.observe(loadMoreTriggerRef.current);
    }

    return () => loadMoreObserver.disconnect();
  }, [hasMore, isLoadingMore, isLoading, offset, fetchSecrets]);

  // Observe notes when they're added to DOM
  useEffect(() => {
    const noteElements = document.querySelectorAll(".note-card[data-note-id]");
    noteElements.forEach((element) => {
      if (observerRef.current) {
        observerRef.current.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        noteElements.forEach((element) => {
          observerRef.current.unobserve(element);
        });
      }
    };
  }, [notes]);

  const createNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      // Auto-discard empty note
      setShowModal(false);
      setNewNote({ title: "", content: "" });
      return;
    }

    setIsSaving(true);
    const key = await getEncryptionKey();
    if (!key) {
      toast.error("Session expired. Please log in again.");
      navigate("/");
      return;
    }

    try {
      // Your encryptText function returns {ciphertext, iv}
      const titleResult = await encryptText(newNote.title || "Untitled", key);
      const bodyResult = await encryptText(newNote.content || "", key);

      const response = await fetch(`${API_URL}/api/secrets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title_encrypted: titleResult.ciphertext,
          iv_title: titleResult.iv,
          body_encrypted: bodyResult.ciphertext,
          iv_body: bodyResult.iv,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create note");
      }

      const result = await response.json();

      // Add the new note to the beginning of the list
      const newNoteObj = {
        id: result.id,
        title: newNote.title || "Untitled",
        content: newNote.content || "",
        isContentDecrypted: true,
        isDecrypting: false,
        created_at: new Date().toISOString(),
      };

      setNotes((prev) => [newNoteObj, ...prev]);
      setShowModal(false);
      setNewNote({ title: "", content: "" });
      toast.success("Note created successfully!");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Failed to create note");
    } finally {
      setIsSaving(false);
    }
  };

  const openModal = () => {
    setShowModal(true);
    setNewNote({ title: "", content: "" });
    // Focus title input after modal opens
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 100);
  };

  const closeModal = () => {
    if (isSaving) return; // Don't close while saving
    createNote(); // Auto-save on close
  };

  const discardNote = () => {
    setShowModal(false);
    setNewNote({ title: "", content: "" });
  };

  // Handle click outside modal
  const handleModalBackdropClick = (e) => {
    if (e.target === modalRef.current) {
      closeModal();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showModal]);

  useEffect(() => {
    fetchSecrets();
  }, []);

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
            <>
              <div className="notes-grid">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="note-card"
                    data-note-id={note.id}
                  >
                    <div className="note-title">{note.title}</div>
                    <div className="note-content">
                      {note.isDecrypting ? (
                        <div className="content-loading">
                          <div className="mini-spinner"></div>
                          <span>Decrypting...</span>
                        </div>
                      ) : note.isContentDecrypted ? (
                        <div className="content-text">{note.content}</div>
                      ) : (
                        <div className="content-placeholder">
                          Content will load when visible...
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Load more trigger */}
              {hasMore && (
                <div ref={loadMoreTriggerRef} className="load-more-trigger">
                  {isLoadingMore && (
                    <div className="loading-more">
                      <div className="mini-spinner"></div>
                      <span>Loading more secrets...</span>
                    </div>
                  )}
                </div>
              )}

              {/* End of content indicator */}
              {!hasMore && notes.length > 0 && (
                <div className="end-indicator">
                  <div className="end-icon">
                    <Fish />
                  </div>
                  <span>You've reached the end!</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Add Button */}
      <button
        className="add-button"
        onClick={openModal}
        title="Create new secret"
      >
        +
      </button>

      {/* Create Note Modal */}
      {showModal && (
        <div
          className="modal-backdrop"
          ref={modalRef}
          onClick={handleModalBackdropClick}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <input
                ref={titleInputRef}
                className="modal-title-input"
                placeholder="Title"
                value={newNote.title}
                onChange={(e) =>
                  setNewNote((prev) => ({ ...prev, title: e.target.value }))
                }
                disabled={isSaving}
              />
              <button
                className="discard-button"
                onClick={discardNote}
                title="Discard note"
              >
                <X />
              </button>
            </div>

            <textarea
              className="modal-content-textarea"
              placeholder="Take a note..."
              value={newNote.content}
              onChange={(e) =>
                setNewNote((prev) => ({ ...prev, content: e.target.value }))
              }
              disabled={isSaving}
            />

            {isSaving && (
              <div className="saving-indicator">
                <div className="mini-spinner"></div>
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Secrets;
