import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type ReviewSectionProps = {
  rating: number; // Quitamos el '?' para obligar a pasar un número (aunque sea 0)
  totalReviews: number;
};

export default function ReviewSection({
  rating,
  totalReviews,
}: ReviewSectionProps) {
  
  const renderStars = (score: number) => {
    // Redondeamos para mostrar estrellas llenas/vacías
    const roundedScore = Math.round(score);
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      stars += i <= roundedScore ? "★" : "☆"; // Usamos ★ para que sea más consistente
    }
    return stars;
  };

  return (
    <View style={styles.container}>
      {totalReviews > 0 ? (
        <>
          <Text style={styles.starsText}>
            {renderStars(rating)} 
            <Text style={{ fontSize: 16, color: '#333' }}> {rating.toFixed(1)}</Text>
          </Text>
          <Text style={styles.countText}>({totalReviews} reseñas)</Text>
        </>
      ) : (
        <Text style={styles.countText}>(Sin reseñas aún)</Text>
      )}
    </View>
  );
}

// ... tus estilos están perfectos
const styles = StyleSheet.create({
  container: { 
    paddingHorizontal: 20,
    marginBottom: 5,
    alignItems: 'center' 
  },
  starsText: { 
    fontSize: 20, 
    color: 'gold', 
    marginBottom: 5 // Ajustado para que no haya tanto hueco
  },
  countText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2, // Para que quede cerca de las estrellas
    marginBottom: 15,
  }
});
