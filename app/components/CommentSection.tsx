import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export type Comment = {
  id: string;
  userName: string;
  avatarUrl?: string | null; // Nuevo: para la foto real
  rating: number;
  text: string;
  date: string; 
};

type CommentSectionProps = {
  comments?: Comment[];
};

export default function CommentSection({ comments = [] }: CommentSectionProps) {
  const totalReviews = comments.length;
  
  // Cálculo del promedio
  const averageRating = totalReviews > 0 
    ? (comments.reduce((acc, c) => acc + c.rating, 0) / totalReviews).toFixed(1)
    : 0;

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Comentarios ({totalReviews > 0 ? `${averageRating} ⭐, ${totalReviews} reviews` : "Sin reseñas"})
      </Text>

      {comments.length > 0 ? (
        comments.map((comment) => (
          <View key={comment.id} style={styles.commentCard}>
            {/* Foto Real de Supabase o Círculo con Inicial */}
            {comment.avatarUrl ? (
              <Image source={{ uri: comment.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: '#ccc', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{fontSize: 12, color: '#fff'}}>{comment.userName.charAt(0)}</Text>
              </View>
            )}
            
            <View style={styles.content}>
              <View style={styles.headerRow}>
                <Text style={styles.userName}>{comment.userName}</Text>
                <Text style={styles.dateText}>{comment.date}</Text>
              </View>
              <Text style={styles.stars}>{renderStars(comment.rating)}</Text>
              <Text style={styles.commentText}>"{comment.text}"</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Aún no hay puntuaciones.</Text>
          <Text style={styles.emptySubText}>Los comentarios de otros usuarios aparecerán aquí.</Text>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  commentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  avatar: { // Reemplaza avatarPlaceholder por este
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateText: {
    fontSize: 10,
    color: '#999',
  },
  stars: {
    fontSize: 14,
    color: 'gold',
  },
  commentText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    fontStyle: 'italic',
  },
  emptyCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  emptySubText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
});
