import React, { useState } from 'react'; // Quitamos useRef
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';

type AddCommentProps = {
  isEditable?: boolean; 
  onSave?: (newComment: { rating: number; text: string }) => Promise<void>;
  onExpand?: () => void; // <--- Agregamos esta prop para avisar al padre
};

export default function AddComment({ isEditable = false, onSave, onExpand }: AddCommentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isEditable) return null;

  // Función para abrir el formulario y avisar al scroll del padre
  const handleExpand = () => {
    setIsExpanded(true);
    if (onExpand) {
      // Le damos un pequeño delay para que el componente se renderice antes de scrollear
      setTimeout(onExpand, 100);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Atención", "Por favor, selecciona una puntuación.");
      return;
    }
    if (comment.trim().length < 5) {
      Alert.alert("Atención", "El comentario es muy corto.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (onSave) {
        await onSave({ rating, text: comment });
        Alert.alert("¡Gracias!", "Tu reseña ha sido publicada.");
        setIsExpanded(false);
        setRating(0);
        setComment('');
      }
    } catch (error: any) {
      console.error("Error al guardar reseña:", error);
      Alert.alert(
        "No se pudo publicar", 
        error.message || "Error desconocido en el servidor."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {!isExpanded ? (
        <TouchableOpacity 
          style={styles.expandButton} 
          onPress={handleExpand} // <--- Usamos handleExpand
        >
          <Text style={styles.expandButtonText}>+ Dejar una reseña</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>¿Qué te pareció?</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((num) => (
              <TouchableOpacity key={num} onPress={() => setRating(num)}>
                <Text style={[styles.starIcon, { color: num <= rating ? 'gold' : '#ccc' }]}>
                  {num <= rating ? '★' : '☆'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.input}
            placeholder="Escribe tu experiencia aquí..."
            multiline
            numberOfLines={4}
            value={comment}
            onChangeText={setComment}
            editable={!isSubmitting}
            onFocus={onExpand} // <--- Si toca el input, también avisamos al scroll
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.cancelButton, { flex: 1, marginRight: 8 }]} 
              onPress={() => setIsExpanded(false)}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.submitButton, { flex: 2 }]} 
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitText}>Publicar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
// ... (tus estilos quedan igual)
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    marginTop: 10,
  },
  expandButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2FB8A6',
    borderStyle: 'dashed',
  },
  expandButtonText: {
    color: '#2FB8A6',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 4, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  starIcon: {
    fontSize: 35,
    marginHorizontal: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    height: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    width: '100%', // Asegura que ocupe todo el ancho
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    minHeight: 48,
  },
  cancelText: {
    color: '#999',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#2FB8A6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48, // Tamaño mínimo táctil recomendado por Google/Android
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});