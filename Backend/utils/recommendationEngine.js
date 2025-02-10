export const calculateRecommendations = async (userPreferences, excludeBooks = []) => {
    const { favoriteGenres, favoriteAuthors, readingLevel } = userPreferences;
    
    const recommendations = await Book.aggregate([
      {
        $match: {
          _id: { $nin: excludeBooks },
          genre: { $in: favoriteGenres },
          $or: [
            { author: { $in: favoriteAuthors } },
            { averageRating: { $gte: 4 } }
          ]
        }
      },
      {
        $addFields: {
          relevanceScore: {
            $sum: [
              { $multiply: [
                { $size: { $setIntersection: ["$genre", favoriteGenres] } },
                2
              ]},
              { $cond: [
                { $in: ["$author", favoriteAuthors] },
                3,
                0
              ]},
              { $multiply: ["$averageRating", 0.5] }
            ]
          }
        }
      },
      { $sort: { relevanceScore: -1 } },
      { $limit: 10 }
    ]);
  
    return recommendations;
  };