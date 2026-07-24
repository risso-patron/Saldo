import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card } from '../Shared/Card';
import { Button } from '../Shared/Button';
import { useSubscription } from '../../hooks/useSubscription';
import { UpgradeModal } from '../Subscription/UpgradeModal';

/**
 * Componente para gestionar tarjetas de crédito
 */
export const CreditCardManager = ({ creditCards, onAddCard, onUpdateDebt, onRemoveCard }) => {
  const { hasFeature } = useSubscription();
  const [cardName, setCardName] = useState('');
  const [creditLimit, setCreditLimit] = useState('');
  const [currentDebt, setCurrentDebt] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const handleAddCard = (e) => {
    e.preventDefault();
    if (!cardName.trim() || !creditLimit || parseFloat(creditLimit) <= 0) {
      return;
    }

    // RC-1.6/C1: Feature gate — crear una tarjeta nueva es exclusivo de PRO
    // (gestionar las ya existentes -- editar deuda, eliminar, visualizar --
    // no forma parte de este hallazgo, mismo criterio que el gate de
    // exportación en ExportManager.jsx).
    if (!hasFeature('credit_cards')) {
      setShowUpgradeModal(true);
      return;
    }

    const success = onAddCard({
      name: cardName,
      limit: parseFloat(creditLimit),
      debt: parseFloat(currentDebt) || 0,
      id: Date.now(),
    });

    if (success) {
      setCardName('');
      setCreditLimit('');
      setCurrentDebt('');
      setShowAddForm(false);
    }
  };

  const handleUpdateDebt = (cardId, newDebt) => {
    onUpdateDebt(cardId, parseFloat(newDebt) || 0);
  };

  const getAvailableCredit = (card) => {
    return card.limit - card.debt;
  };

  const getUsagePercentage = (card) => {
    return ((card.debt / card.limit) * 100).toFixed(1);
  };

  const getUsageColor = (percentage) => {
    if (percentage >= 90) return 'text-red-600 bg-red-100';
    if (percentage >= 70) return 'text-orange-600 bg-orange-100';
    if (percentage >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  return (
    <Card title="Tarjetas de Crédito">
      <div className="space-y-4">
        {/* Lista de tarjetas */}
        {creditCards.length > 0 ? (
          <div className="space-y-4">
            {creditCards.map((card) => {
              const available = getAvailableCredit(card);
              const usage = getUsagePercentage(card);
              
              return (
                <div key={card.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-800">{card.name}</h3>
                      <p className="text-sm text-gray-500">Límite: ${card.limit.toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => onRemoveCard(card.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* Barra de progreso */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          usage >= 90 ? 'bg-red-500' :
                          usage >= 70 ? 'bg-orange-500' :
                          usage >= 50 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(usage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Uso: {usage}%</span>
                      <span>Disponible: ${available.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Deuda actual */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Deuda Actual
                      </label>
                      <input
                        type="number"
                        value={card.debt}
                        onChange={(e) => handleUpdateDebt(card.id, e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                        step="0.01"
                        min="0"
                        max={card.limit}
                      />
                    </div>
                    <div className="flex items-end">
                      <div className={`px-3 py-2 rounded-lg font-semibold ${getUsageColor(usage)}`}>
                        ${available.toFixed(2)} disponible
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No hay tarjetas registradas</p>
        )}

        {/* Botón para mostrar formulario */}
        {!showAddForm && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className="w-full"
          >
            + Agregar Tarjeta de Crédito
          </Button>
        )}

        {/* Formulario para agregar tarjeta */}
        {showAddForm && (
          <form onSubmit={handleAddCard} className="border-2 border-blue-200 rounded-lg p-4 space-y-3 bg-blue-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de la Tarjeta
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Ej: Visa Principal, Mastercard"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite de Crédito ($)
              </label>
              <input
                type="number"
                value={creditLimit}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deuda Actual ($) - Opcional
              </label>
              <input
                type="number"
                value={currentDebt}
                onChange={(e) => setCurrentDebt(e.target.value)}
                placeholder="0"
                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                step="0.01"
                min="0"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                Agregar Tarjeta
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setCardName('');
                  setCreditLimit('');
                  setCurrentDebt('');
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>

      {showUpgradeModal && (
        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          feature="credit_cards"
        />
      )}
    </Card>
  );
};

CreditCardManager.propTypes = {
  creditCards: PropTypes.array.isRequired,
  onAddCard: PropTypes.func.isRequired,
  onUpdateDebt: PropTypes.func.isRequired,
  onRemoveCard: PropTypes.func.isRequired,
};
