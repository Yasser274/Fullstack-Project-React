import type { Restaurant } from "../pages/HomePage";

// 1. Create a new type alias by "indexing" into the Restaurant type.
//    - Restaurant['reviews'] gets the type of the 'reviews' property (which is Review[])
//    - [number] gets the type of the elements inside that array (which is Review)
type ReviewProps = Restaurant["reviews"][number];

const ReviewComments = ({ rating, comment, reviewedAt, user }: ReviewProps) => {
   return (
      <div>
         <div>{rating}</div>
         <div>{comment}</div>
         <div>{reviewedAt}</div>
         <div>{user.username}</div>
         <div>{user.profilePictureURL}</div>
      </div>
   );
};

export default ReviewComments;
