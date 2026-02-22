/**
 * BooklistModal — create / edit a custom booklist.
 */
import Modal from "..";

function BooklistModal({ open, editingList, name, description, onNameChange, onDescriptionChange, onClose, onSubmit }) {
  return (
    <Modal
      open={open}
      title={editingList ? "Edit Booklist" : "New Booklist"}
      onClose={onClose}
    >
      <div className="modal-field">
        <label>Name</label>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g. Summer Reading"
        />
      </div>
      <div className="modal-field">
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          placeholder="Optional description"
        />
      </div>
      <div className="modal-actions">
        <button className="modal-btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="modal-btn-primary" onClick={onSubmit}>
          {editingList ? "Save" : "Create"}
        </button>
      </div>
    </Modal>
  );
}

export default BooklistModal;
