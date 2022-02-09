import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Spinner from "../hooks/Spinner";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { db } from "../firebase.config";
import { v4 as uuidv4 } from "uuid";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
const CreateListing = () => {
  const [loading, setLoading] = useState(false);
  const [totalImagesUploaded, setTotalImagesUploaded] = useState(0);
  const [geoLocationEnabled] = useState(true);
  const [uploadingStarted, setUploadingStarted] = useState(false);
  const [loadingInformation, setLoadingInformation] = useState(
    " validations checked "
  );
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {},
    latitude: 0,
    longitude: 0,
  });
  const auth = getAuth();
  const navigate = useNavigate();
  const isMounted = useRef(true);
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;
  useEffect(() => {
    if (isMounted) {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setFormData({ ...formData, userRef: user.uid });
        } else {
          navigate("/signin");
        }
      });
    }
    return () => [(isMounted.current = false)];
  }, [auth, navigate, formData]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted price should be less than regular price");
      return;
    }
    if (images.length > 6) {
      setLoading(false);
      toast.error("Maximum 6 images allowed");
      return;
    }
    setLoadingInformation("GeoLocation information fetched started");

    let geoLocation = {};
    let location;
    if (geoLocationEnabled) {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${process.env.REACT_APP_GEOCODING_API}`
      );
      const data = await response.json();
      geoLocation.latitude = data.results[0]?.geometry.location.lat;
      geoLocation.longitude = data.results[0]?.geometry.location.lng;
      location =
        data.status === "ZERO_RESULTS"
          ? undefined
          : data.results[0]?.formatted_address;
      if (location === undefined || location.includes("undefined")) {
        setLoading(false);
        toast.error("Invalid address");
        return;
      }
    } else {
      geoLocation.lat = latitude;
      geoLocation.lng = longitude;
      location = address;
    }
    setLoadingInformation("GeoLocation information fetched sucessfully");

    const storeImages = async (image) => {
      return new Promise((resolve, reject) => {
        const storage = getStorage();
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        const storageRef = ref(storage, "images/" + fileName);
        const uploadTask = uploadBytesResumable(storageRef, image);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          },
          (error) => {
            // A full list of error codes is available at
            // https://firebase.google.com/docs/storage/web/handle-errors
            reject(error);
          },
          () => {
            // Upload completed successfully, now we can get the download URL
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
              setTotalImagesUploaded((prev) => prev + 1);
            });
          }
        );
      });
    };
    setUploadingStarted(true);
    setLoadingInformation("Images uploading started");
    const imgUrls = await Promise.all(
      [...images].map((image) => {
        return storeImages(image);
      })
    ).catch((error) => {
      setLoading(false);

      toast.error("Error uploading images");
    });
    // setLoading(false);
    setLoadingInformation("Images uploading completed");
    const formdataCopy = {
      ...formData,
      imgUrls,
      geoLocation,
      timestamp: serverTimestamp(),
    };
    delete formdataCopy.images;
    delete formdataCopy.address;
    location && (formdataCopy.location = location);
    setLoadingInformation("Data uploading started");
    !formdataCopy.offer && delete formdataCopy.discountedPrice;

    const docRef = await addDoc(collection(db, "listings"), formdataCopy);

    toast.success("Listing created successfully");
    navigate(`/category/${formdataCopy.type}/${docRef.id}`);
  };

  const onMutate = (e) => {
    let boolean = null;

    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    if (e.target.files) {
      setFormData({
        ...formData,
        images: e.target.files,
      });
    }
    if (!e.target.files) {
      setFormData({ ...formData, [e.target.id]: boolean ?? e.target.value });
    }
  };
  if (loading) {
    return <Spinner msg={loadingInformation} />;
  }
  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Create Listing</p>
        <main>
          <form onSubmit={onSubmit}>
            <label className="formLabel">Sell/Rent</label>
            <div className="formButtons">
              <button
                type="button"
                id="type"
                value="sale"
                className={type === "sale" ? "formButtonActive" : "formButton"}
                onClick={onMutate}
              >
                sale
              </button>
              <button
                type="button"
                id="type"
                value="rent"
                className={type === "rent" ? "formButtonActive" : "formButton"}
                onClick={onMutate}
              >
                Rent
              </button>
            </div>
            <label className="formLabel">Name</label>
            <input
              className="formInputName"
              id="name"
              value={name}
              onChange={onMutate}
              required
              maxLength={32}
              minLength={3}
            />
            <div className="formRooms flex">
              <div>
                <label className="formLabel">Bedrooms</label>
                <input
                  className="formInputSmall"
                  id="bedrooms"
                  value={bedrooms}
                  onChange={onMutate}
                  type="number"
                  min="1"
                  max="10"
                  required
                />
              </div>
              <div>
                <label className="formLabel">Bathrooms</label>
                <input
                  className="formInputSmall"
                  id="bathrooms"
                  value={bathrooms}
                  onChange={onMutate}
                  type="number"
                  min="1"
                  max="10"
                  required
                />
              </div>
            </div>
            <label className="formLabel">Parking spot</label>
            <div className="formButtons">
              <button
                className={parking ? "formButtonActive" : "formButton"}
                type="button"
                id="parking"
                value={true}
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={!parking ? "formButtonActive" : "formButton"}
                type="button"
                id="parking"
                value={false}
                onClick={onMutate}
              >
                No
              </button>
            </div>
            <label className="formLabel">Furnished</label>
            <div className="formButtons">
              <button
                className={furnished ? "formButtonActive" : "formButton"}
                type="button"
                id="furnished"
                value={true}
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={
                  !furnished && furnished !== null
                    ? "formButtonActive"
                    : "formButton"
                }
                type="button"
                id="furnished"
                value={false}
                onClick={onMutate}
              >
                No
              </button>
            </div>
            <label className="formLabel">Address</label>
            <textarea
              className="formInputAddress"
              type="text"
              id="address"
              value={address}
              onChange={onMutate}
              required
            />
            {!geoLocationEnabled && (
              <div className="formLatLng flex">
                <div>
                  <label className="formLabel">Latitude</label>
                  <input
                    className="formInputSmall"
                    type="number"
                    id="latitude"
                    value={latitude}
                    onChange={onMutate}
                    required
                  />
                </div>
                <div>
                  <label className="formLabel">Longitude</label>
                  <input
                    className="formInputSmall"
                    type="number"
                    id="longitude"
                    value={longitude}
                    onChange={onMutate}
                    required
                  />
                </div>
              </div>
            )}

            <label className="formLabel">Offer</label>
            <div className="formButtons">
              <button
                className={offer ? "formButtonActive" : "formButton"}
                type="button"
                id="offer"
                value={true}
                onClick={onMutate}
              >
                Yes
              </button>
              <button
                className={
                  !offer && offer !== null ? "formButtonActive" : "formButton"
                }
                type="button"
                id="offer"
                value={false}
                onClick={onMutate}
              >
                No
              </button>
            </div>

            <label className="formLabel">Regular Price</label>
            <div className="formPriceDiv">
              <input
                className="formInputSmall"
                type="number"
                id="regularPrice"
                value={regularPrice}
                onChange={onMutate}
                min="50"
                max="750000000"
                required
              />
              {type === "rent" && <p className="formPriceText">$ / Month</p>}
            </div>

            {offer && (
              <>
                <label className="formLabel">Discounted Price</label>
                <input
                  className="formInputSmall"
                  type="number"
                  id="discountedPrice"
                  value={discountedPrice}
                  onChange={onMutate}
                  min="50"
                  max="750000000"
                  required={offer}
                />
              </>
            )}
            <label className="formLabel">Images</label>
            <p className="imagesInfo">
              The first image will be the cover (max 6).
            </p>
            <input
              className="formInputFile"
              type="file"
              id="images"
              onChange={onMutate}
              max="6"
              accept=".jpg,.png,.jpeg"
              multiple
              required
            />
            {uploadingStarted && (
              <p className="imagesInfo">{totalImagesUploaded} uploaded</p>
            )}

            <button type="submit" className="primaryButton createListingButton">
              Create Listing
            </button>
          </form>
        </main>
      </header>{" "}
    </div>
  );
};

export default CreateListing;
