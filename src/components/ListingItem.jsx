import { ReactComponent as DeleteIcon } from "../assets/svg/deleteIcon.svg";
import { ReactComponent as EditIcon } from "../assets/svg/editIcon.svg";
import bedIcon from "../assets/svg/bedIcon.svg";
import bathtubIcon from "../assets/svg/bathtubIcon.svg";
import { Link } from "react-router-dom";
const ListingItem = ({ listing, id, OnDelete, onEdit }) => {
  return (
    <li className="categoryListing">
      <Link
        to={`/category/${listing.type}/${id}`}
        className="categoryListingLink"
      >
        <img
          src={listing.imgUrls[0]}
          alt={listing.name}
          className="categoryListingImg"
        />
        <div className="categoryListingDetails">
          <p className="categoryListingLocation">{listing.location}</p>
          <p className="categoryListingName">{listing.name} </p>
          <p className="categoryListingPrice">
            {" "}
            {listing.offer
              ? listing.discountedPrice
                  .toString()
                  .replace(/(d)(?=(d{3})+(?!d))/g, ",")
              : listing.regularPrice
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!d))/g, ",")}
            {listing.type === "rent" && " / Month"}
          </p>
          <div className="categoryListingInfoDiv">
            <img src={bedIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {listing.bedrooms > 1
                ? `${listing.bedrooms} Bedrooms`
                : "1 Beedrom"}
            </p>
            <img src={bathtubIcon} alt="bed" />
            <p className="categoryListingInfoText">
              {listing.bathroom > 1
                ? `${listing.bathroom} bathrooms`
                : "1 bathroom"}
            </p>
          </div>
        </div>
      </Link>
      {OnDelete && (
        <DeleteIcon
          className="removeIcon"
          fill="rgba(231,76,60)"
          onClick={() => OnDelete(listing.id, listing.name)}
        />
      )}
      {onEdit && (
        <EditIcon className="editIcon" onClick={() => onEdit(listing.id)} />
      )}
    </li>
  );
};

export default ListingItem;
