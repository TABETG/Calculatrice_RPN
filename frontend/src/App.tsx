// frontend/src/App.tsx
import { useState } from 'react';
import {
  Plus, Minus, X, Divide, Trash2, RefreshCw, Undo, Sun, Moon,
  SquareStack, ArrowUpDown, GitBranch, Loader2
} from 'lucide-react';
import { useRpnStack } from './hooks/useRpnStack';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import { ToastContainer } from './components/Toast';
import type { Operation } from './services/enhancedStackService';

function App() {
  const { stack, loading, initializing, push, performOperation, clear, undo, refresh } = useRpnStack();
  const { toasts, showToast, removeToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const [inputValue, setInputValue] = useState('');

  const validateInput = (value: string): { valid: boolean; error?: string } => {
    if (!value.trim()) return { valid: false, error: 'Veuillez entrer une valeur' };
    const num = parseFloat(value);
    if (isNaN(num)) return { valid: false, error: 'Veuillez entrer un nombre valide' };
    if (!isFinite(num)) return { valid: false, error: 'Le nombre doit être fini' };
    return { valid: true };
  };

  const handlePush = async () => {
    const validation = validateInput(inputValue);
    if (!validation.valid) {
      showToast(validation.error!, 'error');
      return;
    }
    try {
      await push(parseFloat(inputValue));
      setInputValue('');
      showToast('Nombre ajouté avec succès', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'ajout", 'error');
    }
  };

  const handleOperation = async (op: Operation) => {
    try {
      await performOperation(op);
      const opNames: Record<Operation, string> = {
        '+': 'Addition',
        '-': 'Soustraction',
        '*': 'Multiplication',
        '/': 'Division',
        'sqrt': 'Racine carrée',
        'pow': 'Puissance',
        'swap': 'Échange',
        'dup': 'Duplication',
        'drop': 'Suppression',
      };
      showToast(`${opNames[op]} effectuée`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Erreur lors de l'opération", 'error');
    }
  };

  const handleClear = async () => {
    try {
      await clear();
      showToast('Pile vidée', 'success');
    } catch {
      showToast('Erreur lors du nettoyage', 'error');
    }
  };

  const handleUndo = async () => {
    try {
      await undo();
      showToast('Annulation effectuée', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Impossible d'annuler", 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handlePush();
  };

  const topValue = stack.length > 0 ? stack[stack.length - 1] : null;

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-cyan-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 transition-colors duration-300">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">Calculatrice RPN</h1>
                  <p className="text-cyan-100 text-sm mt-2 font-medium">Reverse Polish Notation</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                  aria-label={theme === 'dark' ? 'Activer le mode clair' : 'Activer le mode sombre'}
                >
                  {theme === 'dark' ? <Sun size={24} className="text-white" /> : <Moon size={24} className="text-white" />}
                </button>
              </div>
            </div>

            <div className="p-8">
              {topValue !== null && (
                <div className="mb-6 p-6 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-2xl">
                  <p className="text-xs text-cyan-300 font-semibold mb-1 uppercase tracking-wider">Résultat actuel</p>
                  <p className="text-4xl font-bold text-cyan-300 font-mono" role="status" aria-live="polite">
                    {topValue}
                  </p>
                </div>
              )}

              <div className="mb-6">
                <label htmlFor="number-input" className="block text-sm font-semibold text-slate-200 mb-3">
                  Ajouter un nombre
                </label>
                <div className="flex gap-3">
                  <input
                    id="number-input"
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Entrez un nombre"
                    disabled={loading}
                    className="flex-1 px-5 py-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all disabled:bg-slate-800 disabled:cursor-not-allowed text-lg font-mono"
                    aria-label="Entrez un nombre à ajouter à la pile"
                  />
                  <button
                    onClick={handlePush}
                    disabled={loading || !inputValue.trim()}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-500 hover:to-blue-500 transition-all disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-cyan-500/50 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                    aria-label="Ajouter le nombre à la pile"
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-200">
                    Pile ({stack.length} élément{stack.length !== 1 ? 's' : ''})
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handleUndo}
                      disabled={loading}
                      className="text-cyan-400 hover:text-cyan-300 transition-all disabled:text-slate-600 p-2 hover:bg-cyan-500/10 rounded-lg"
                      title="Annuler (Undo)"
                      aria-label="Annuler la dernière opération"
                    >
                      <Undo size={20} />
                    </button>
                    <button
                      onClick={refresh}
                      disabled={loading}
                      className="text-cyan-400 hover:text-cyan-300 transition-all disabled:text-slate-600 transform hover:rotate-180 transition-transform duration-500 p-2 hover:bg-cyan-500/10 rounded-lg"
                      title="Actualiser"
                      aria-label="Actualiser la pile"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                <div
                  className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 min-h-[200px] max-h-[300px] overflow-y-auto backdrop-blur-sm shadow-inner"
                  role="region"
                  aria-label="Contenu de la pile"
                >
                  {stack.length === 0 ? (
                    <p className="text-slate-500 text-center text-lg py-8">Pile vide</p>
                  ) : (
                    <div className="space-y-2">
                      {[...stack].reverse().map((value, index) => (
                        <div
                          key={`stack-${index}`}
                          className={`${
                            index === 0
                              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 border-cyan-400'
                              : 'bg-gradient-to-r from-slate-700 to-slate-800 border-slate-600'
                          } px-5 py-3 rounded-lg border flex justify-between items-center hover:border-cyan-500 transition-all transform hover:scale-102 shadow-lg`}
                        >
                          <span className={`${index === 0 ? 'text-white text-2xl' : 'text-cyan-300 text-xl'} font-mono font-bold`}>
                            {value}
                          </span>
                          <span className="text-xs text-slate-400 font-semibold px-2 py-1 bg-slate-900/50 rounded">
                            {index === 0 ? 'TOP' : `#${stack.length - index - 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-200">Opérations de base</label>
                <div className="grid grid-cols-4 gap-3" role="group" aria-label="Opérations arithmétiques de base">
                  <button
                    onClick={() => handleOperation('+')}
                    disabled={loading || stack.length < 2}
                    className="p-5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-400 hover:to-emerald-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center font-bold text-2xl shadow-xl hover:shadow-emerald-500/50 disabled:shadow-none transform hover:scale-110 disabled:transform-none"
                    title="Addition"
                    aria-label="Addition"
                  >
                    <Plus size={28} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => handleOperation('-')}
                    disabled={loading || stack.length < 2}
                    className="p-5 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-400 hover:to-orange-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center font-bold text-2xl shadow-xl hover:shadow-orange-500/50 disabled:shadow-none transform hover:scale-110 disabled:transform-none"
                    title="Soustraction"
                    aria-label="Soustraction"
                  >
                    <Minus size={28} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => handleOperation('*')}
                    disabled={loading || stack.length < 2}
                    className="p-5 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-400 hover:to-blue-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center font-bold text-2xl shadow-xl hover:shadow-blue-500/50 disabled:shadow-none transform hover:scale-110 disabled:transform-none"
                    title="Multiplication"
                    aria-label="Multiplication"
                  >
                    <X size={28} strokeWidth={3} />
                  </button>
                  <button
                    onClick={() => handleOperation('/')}
                    disabled={loading || stack.length < 2}
                    className="p-5 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-400 hover:to-red-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center font-bold text-2xl shadow-xl hover:shadow-red-500/50 disabled:shadow-none transform hover:scale-110 disabled:transform-none"
                    title="Division"
                    aria-label="Division"
                  >
                    <Divide size={28} strokeWidth={3} />
                  </button>
                </div>

                <label className="block text-sm font-semibold text-slate-200 mt-4">Opérations avancées</label>
                <div className="grid grid-cols-5 gap-2" role="group" aria-label="Opérations avancées">
                  <button
                    onClick={() => handleOperation('sqrt')}
                    disabled={loading || stack.length < 1}
                    className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-400 hover:to-purple-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-lg hover:shadow-purple-500/30 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                    title="Racine carrée"
                    aria-label="Racine carrée"
                  >
                    √
                  </button>
                  <button
                    onClick={() => handleOperation('pow')}
                    disabled={loading || stack.length < 2}
                    className="p-3 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-400 hover:to-pink-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center font-bold text-sm shadow-lg hover:shadow-pink-500/30 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                    title="Puissance (x^y)"
                    aria-label="Puissance"
                  >
                    x^y
                  </button>
                  <button
                    onClick={() => handleOperation('swap')}
                    disabled={loading || stack.length < 2}
                    className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-400 hover:to-indigo-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-indigo-500/30 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                    title="Échanger les 2 derniers éléments"
                    aria-label="Échanger"
                  >
                    <ArrowUpDown size={18} />
                  </button>
                  <button
                    onClick={() => handleOperation('dup')}
                    disabled={loading || stack.length < 1}
                    className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-400 hover:to-teal-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-teal-500/30 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                    title="Dupliquer le dernier élément"
                    aria-label="Dupliquer"
                  >
                    <SquareStack size={18} />
                  </button>
                  <button
                    onClick={() => handleOperation('drop')}
                    disabled={loading || stack.length < 1}
                    className="p-3 bg-gradient-to-br from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-gray-500/30 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                    title="Supprimer le dernier élément"
                    aria-label="Supprimer"
                  >
                    <GitBranch size={18} />
                  </button>
                </div>

                <button
                  onClick={handleClear}
                  disabled={loading || stack.length === 0}
                  className="w-full p-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:from-rose-500 hover:to-pink-500 transition-all disabled:from-slate-700 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold shadow-lg hover:shadow-rose-500/50 disabled:shadow-none transform hover:scale-105 disabled:transform-none"
                  aria-label="Vider complètement la pile"
                >
                  <Trash2 size={22} />
                  Vider la pile
                </button>
              </div>

              <div className="mt-6 p-5 bg-slate-900/30 border border-slate-700/50 rounded-xl backdrop-blur-sm">
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-cyan-400">Comment utiliser :</strong><br />
                  <span className="text-slate-300">1.</span> Ajoutez des nombres dans la pile<br />
                  <span className="text-slate-300">2.</span> Sélectionnez une opération<br />
                  <span className="text-slate-300">3.</span> Le résultat remplace les opérandes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
