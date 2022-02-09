import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { db } from "../firebase.config";
const Contact = () => {
  const [message, setMessage] = useState("");
  const [landlord, setLandLord] = useState(null);
  const [searchParams] = useSearchParams();
  const params = useParams();
  useEffect(() => {
    const fetchLandLord = async () => {
      const docRef = doc(db, "users", params.landlordId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setLandLord(docSnap.data());
      } else {
        toast.error("Landlord not found");
      }
    };
    fetchLandLord();
  }, [params.landlordId]);
  return (
    <div className="pageContainer">
      <header>
        <p className="pageHeader">Contact Landlord</p>
      </header>
      {landlord && (
        <main>
          <div className="contactLandlord">
            <p className="landlordName"> contact {landlord?.name}</p>
          </div>
          <form className="messageForm">
            <div className="messageDiv">
              <label htmlFor="message" className="messageLabel">
                Message
              </label>
              <textarea
                id="message"
                className="textarea"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            <a
              href={`mailto:${landlord?.email}?subject=${searchParams.get(
                "listingName"
              )}&body=${message}`}
            >
              <button type="button" className="primaryButton">
                Send Message
              </button>
            </a>
          </form>
        </main>
      )}
    </div>
  );
};

export default Contact;
