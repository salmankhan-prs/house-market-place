import Spinner from "../hooks/Spinner";
import { db } from "../firebase.config";
import { getAuth } from "firebase/auth";
import shareIcon from "../assets/svg/shareIcon.svg";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import SwiperCore, { A11y, Navigation, Pagination, Scrollbar } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { MapContainer, TileLayer } from "react-leaflet";

SwiperCore.use([Navigation, Pagination, Scrollbar, A11y]);
const Listing = () => {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);
  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();
  useEffect(() => {
    const fetchListing = async () => {
      const docRef = doc(db, "listings", params.listingId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setListing(docSnap.data());
        setLoading(false);
      }
    };
    fetchListing();
  }, [navigate, params.listingId]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <main>
      <Swiper slidesPerView={1} pagination={{ clickable: true }}>
        {listing.imgUrls.map((url, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                background: `url(${listing.imgUrls[index]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            ></div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="shareIconDiv"
        onClick={() => {
          navigator.clipboard.writeText(window.location.href);
          setShareLinkCopied(true);
          setTimeout(() => {
            setShareLinkCopied(false);
          }, 2000);
        }}
      >
        <img src={shareIcon} alt="share icon" className="shareIcon" />
      </div>
      {shareLinkCopied && (
        <div className="linkCopied">Link copied to clipboard</div>
      )}
      <div className="listingDetails">
        <p className="listingName">
          {listing.name}-{"$"}
          {listing.offer
            ? listing.discountedPrice
                .toString()
                .replace(/(d)(?=(d{3})+(?!d))/g, ",")
            : listing.regularPrice
                .toString()
                .replace(/\B(?=(\d{3})+(?!d))/g, ",")}
        </p>
        <p className="listinglocation">{listing.location}</p>
        <p className="listingType">
          For {listing.type === "rent" ? "Rent" : "Sale"}
        </p>
        {listing.offer && (
          <p className="discountPrice">
            ${listing.regularPrice - listing.discountedPrice} discount
          </p>
        )}
        <ul className="listingDetailsListing">
          <li>
            {listing.bedrooms > 1
              ? `${listing.bedrooms} Bedrooms`
              : "1 Bedroom"}
          </li>
          <li>
            {listing.bathroom > 1}
            {listing.bathroom > 1
              ? `${listing.bathroom} bathrooms`
              : "1 bathroom"}
          </li>
          <li>{listing.parking && "Parking spot"}</li>
          <li>{listing.furnished && "Furnished"}</li>
        </ul>
        <p className="listingLocationTitle">Location:</p>

        <div className="leafletContainer">
          <MapContainer
            style={{ height: "100%", width: "100%" }}
            center={[
              listing.geoLocation.latitude,
              listing.geoLocation.longitude,
            ]}
            zoom={13}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png"
            />
          </MapContainer>
        </div>

        {auth.currentUser?.uid !== listing.userRef && (
          <Link
            className="primaryButton"
            to={`/contact/${listing.userRef}?listingName=${listing.name}&listingLocation=${listing.location}`}
          >
            contact LandLord
          </Link>
        )}
      </div>
    </main>
  );
};

export default Listing;
