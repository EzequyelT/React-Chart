import { useState, useEffect, useRef } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { AVATAR_OPTIONS } from '../Utils/Avatar'
import { CARGOS } from '../Utils/Cargos'

import Modal from './Modal'


export default function NodeForm({ nodes = [], onSubmit, nodeToEdit = null, isEditMode, editPresidentSpecial = false }) {
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [parentId, setParentId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState([]);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (nodeToEdit) {
      setName(nodeToEdit.name || '');
      setTitle(nodeToEdit.title || '');
      setParentId(nodeToEdit.parentId != null ? nodeToEdit.parentId : null);
      setImageFile(nodeToEdit.photoBase64 || null);
      setImagePreview(nodeToEdit.photoBase64 || null);
      setErrors([]);
    } else {
      clearForm();
      if (editPresidentSpecial) {
        setTitle('Presidente');
        setParentId(null);
      }
    }
  }, [nodeToEdit, editPresidentSpecial]);

  function clearForm() {
    const isPresidente = title.toLowerCase() === 'presidente';

    setName('');

    if (!isPresidente) {
      setTitle('');
      setParentId(null);
    }

    setImageFile(null);
    setImagePreview(null);
    setErrors([]);

    if (nameInputRef.current) nameInputRef.current.focus();
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'image/png') {
      alert('Só são aceitas imagens PNG.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(reader.result);
    };
    reader.readAsDataURL(file);
  }

  function validateForm() {
    const errs = [];

    if (!name.trim()) errs.push('Nome é obrigatório');
    if (!title) errs.push('Cargo é obrigatório');

    const titleLower = title.toLowerCase();

    if (titleLower !== 'presidente' && (parentId === null || parentId === undefined || parentId === '')) {
      errs.push('Apenas o presidente pode não ter superior.');
    }

    if (titleLower === 'presidente') {
      const existingPresident = nodes.find(n =>
        n.title.toLowerCase() === 'presidente' &&
        n.id !== nodeToEdit?.id
      );
      if (existingPresident) {
        errs.push('Já existe um presidente no organograma.');
      }
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newNode = {
      id: nodeToEdit?.id,
      name,
      title,
      parentId,
      photoBase64: imageFile,
    };

    try {
      await onSubmit(newNode);
      clearForm();
    } catch (err) {
      setErrors([err.message || 'Erro ao salvar']);
    }
  }

  const superioresOptions = nodes.filter(n => n.id !== nodeToEdit?.id);

  const presidenteJaExiste = nodes.some(n =>
    n.title.toLowerCase() === 'presidente' &&
    n.id !== nodeToEdit?.id
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 border border-green-500 rounded shadow max-w-md mx-auto space-y-4">

      <h2 className="text-center font-bold text-2xl mb-4 animate-pulse drop-shadow-md">
        {isEditMode ? (editPresidentSpecial ? 'Novo Presidente' : 'Editar') : 'Adicionar Nó'}
      </h2>

      <div>
        <label htmlFor="name" className="block mb-1 font-semibold">Nome:</label>
        <input
          id="name"
          type="text"
          value={name}
          placeholder="Nome"
          onChange={e => setName(e.target.value)}
          className="border p-2 rounded w-full"
          ref={nameInputRef}
        />
      </div>

      <div>
        <label htmlFor="parentId" className="block mb-1 font-semibold">Superior:</label>
        <select
          id="parentId"
          value={parentId !== null && parentId !== undefined ? String(parentId) : ''}
          onChange={e => {
            const val = e.target.value;
            setParentId(val === '' ? null : Number(val));
          }}
          className="border p-2 rounded w-full"
          disabled={title.toLowerCase() === 'presidente'} // presidente não pode ter superior
        >
          <option value="">Nenhum</option>
          {superioresOptions.map(n => (
            <option key={n.id} value={String(n.id)}>
              {n.name} ({n.title})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="title" className="block mb-1 font-semibold">Cargo:</label>
        <select
          id="title"
          value={title}
          onChange={e => {
            const val = e.target.value;
            setTitle(val);
            if (val.toLowerCase() === 'presidente') {
              setParentId(null);
            }
          }}
          className="border p-2 rounded w-full"
          disabled={nodeToEdit?.title.toLowerCase() === 'presidente'} // desabilita select se estiver editando presidente
        >
          {CARGOS.map(cargo => {
            const isPresidente = cargo.toLowerCase() === 'presidente';
            return (
              <option
                key={cargo}
                value={cargo}
                disabled={cargo === '' || (isPresidente && presidenteJaExiste && title.toLowerCase() !== 'presidente')}
              >
                {cargo === '' ? 'Selecione um cargo' : cargo}
              </option>
            );
          })}
        </select>

      </div>
      <div>
        <label className="block mb-1 font-semibold">Foto:</label>

        <input type="file" accept="image/png" onChange={handleImageChange} className="mb-4 " />

        <button type="button" className="rounded-xl bg-green-600 text-white p-2 hover:bg-green-700 mr-4 " onClick={() => setShowAvatarModal(true)}>Selecionar Imagens Já prontas</button>

        <div className="mt-2 text-center">
          <p className="text-sm font-semibold mb-2">Preview:</p>
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-full mx-auto border shadow bg-slate-600" />
          ) : (
            <FaUserCircle className="w-20 h-20 text-gray-400 mx-auto" />
          )}
        </div>
      </div>

      {showAvatarModal && (
        <Modal onClose={() => setShowAvatarModal(false)}>
          <div className="p-4 max-w-md mx-auto">
            <h1 className="font-semibold text-lg text-center border-b-2 border-green-600 mb-4">
              Escolha um Avatar
            </h1>
            <div className="grid grid-cols-4 gap-3 overflow-y-auto max-h-96">
              {AVATAR_OPTIONS.map((file, index) => (
                <img
                  key={index}
                  src={`/${file}`}
                  alt={`Avatar ${index + 1}`}
                  className="w-16 h-16 rounded-full cursor-pointer border hover:border-green-500 transition bg-slate-400"
                  onClick={() => {
                    setImagePreview(`/${file}`);
                    setImageFile(`/${file}`);
                    setShowAvatarModal(false);
                  }}
                />
              ))}
              <a
                href="https://getavataaars.com/?accessoriesType=Round&avatarStyle=Transparent&clotheColor=Black&clotheType=Overall&eyeType=Cry&eyebrowType=SadConcerned&facialHairColor=Black&facialHairType=Blank&graphicType=Deer&hairColor=Platinum&hatColor=Blue03&mouthType=Sad&skinColor=Pale&topType=LongHairCurly"
                target="_blank"
                rel="noopener noreferrer"
                className="w-16 h-16 rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center hover:border-green-500 transition cursor-pointer"
                title="Criar novo avatar"
              >
                <span className="text-3xl font-bold text-gray-500">+</span>
              </a>
            </div>
          </div>
        </Modal>

      )}


      {errors.length > 0 && (
        <div className="text-red-600 text-sm">
          <ul className="list-disc list-inside space-y-0.5">
            {errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      <div className="flex justify-end space-x-4 mt-4">
        <button type="button" onClick={clearForm} className="px-4 py-2 border rounded-xl bg-stone-300 hover:bg-stone-400">
          Limpar
        </button>
        <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl">
          {nodeToEdit ? 'Atualizar' : 'Salvar'}
        </button>
      </div>
    </form>
  );
}
