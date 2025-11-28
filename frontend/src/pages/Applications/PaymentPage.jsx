import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import {
    CreditCardIcon,
    BuildingLibraryIcon,
    ArrowLeftIcon,
    QrCodeIcon,
    CloudArrowUpIcon
} from '@heroicons/react/24/outline';

const PaymentPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const axiosPrivate = useAxiosPrivate();

    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);

    const [step, setStep] = useState("select");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    
    // Fetch application details
    useEffect(() => {
        const loadApp = async () => {
            try {
                const res = await axiosPrivate.get(`/api/applications/track/${id}`);

                setApplication(res.data.application);
            } catch (err) {
                console.error(err);
                alert("Failed to load application.");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        loadApp();
    }, [id]);

    if (loading) {
        return <div className="text-center p-10">Loading payment details...</div>;
    }

    if (!application) {
        return <div className="text-center p-10 text-red-500">Application not found.</div>;
    }

    const amountToPay =
        application.applicationType === "Building"
            ? application.box6?.totalAmountDue || 0
            : application.feesDetails?.totalAmountDue || 0;

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected) {
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

const handleSubmitOnline = async () => {
        if (!file) return alert("Upload a receipt first.");

        const formData = new FormData();
        // Backend middleware expects the field name "file", not "receipt"
        formData.append("file", file); 
        
        // Backend controller requires these fields to find the application
        formData.append("appId", application._id);
        formData.append("applicationType", application.applicationType);

        try {
            // Updated URL to match applications.js route: /:id/upload-payment
            await axiosPrivate.post(
                `/api/applications/${application._id}/upload-payment`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            alert("Payment submitted successfully!");
            // Refresh page or navigate
            navigate(`/track/${application.referenceNo}`);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Payment upload failed.");
        }
    };


    // --- Step: Select ---
    if (step === "select") {
        return (
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-200 mt-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-blue-900">Payment Window</h2>
                    <p className="text-gray-500">Choose your payment method</p>
                </div>

                {/* Walk-in */}
                <button
                    onClick={() => setStep("walkin")}
                    className="w-full flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-blue-500 transition"
                >
                    <BuildingLibraryIcon className="w-10 h-10 text-blue-600 mr-4" />
                    <div>
                        <h3 className="text-lg font-bold">Walk-In Payment</h3>
                        <p className="text-sm text-gray-500">Pay at the Municipal Treasury</p>
                    </div>
                </button>

                {/* Online */}
                <button
                    onClick={() => setStep("online-qr")}
                    className="w-full flex items-center p-6 border-2 border-gray-100 rounded-xl hover:border-green-500 transition mt-4"
                >
                    <CreditCardIcon className="w-10 h-10 text-green-600 mr-4" />
                    <div>
                        <h3 className="text-lg font-bold">Online Payment</h3>
                        <p className="text-sm text-gray-500">GCash / Maya</p>
                    </div>
                </button>

                <button onClick={() => navigate(-1)} className="mt-6 text-sm text-gray-500 w-full text-center">
                    Cancel
                </button>
            </div>
        );
    }

    // --- Step: Walk-in ---
    if (step === "walkin") {
        return (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-xl border border-gray-200 mt-10 text-center">
                <h2 className="text-2xl font-bold">Walk-In Payment</h2>

                <div className="bg-gray-100 p-8 rounded-xl mt-6">
                    <p className="text-gray-600 mb-2">Present this tracking number:</p>
                    <h1 className="text-4xl font-bold">{application.referenceNo}</h1>

                    <p className="text-gray-600 mt-4">Amount to Pay:</p>
                    <h2 className="text-3xl font-bold text-blue-600">
                        ₱ {amountToPay.toLocaleString()}
                    </h2>
                </div>

                <button
                    onClick={() => setStep("select")}
                    className="text-blue-600 mt-6 text-sm"
                >
                    Choose another method
                </button>
            </div>
        );
    }

    // --- Step: QR Code ---
    if (step === "online-qr") {
        return (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-xl border mt-10 text-center">
                <h2 className="text-2xl font-bold">Online Payment</h2>

                <QrCodeIcon className="w-56 h-56 mx-auto text-gray-600 my-8" />

                <button
                    onClick={() => setStep("online-upload")}
                    className="px-6 py-2 bg-green-600 text-white rounded-full font-semibold"
                >
                    Done Scanning
                </button>
            </div>
        );
    }

    // --- Step: Upload Receipt ---
    if (step === "online-upload") {
        return (
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-xl border mt-10 text-center">
                <h2 className="text-2xl font-bold">Upload Proof of Payment</h2>

                <div className="bg-gray-50 border-2 border-dashed p-8 rounded-xl mt-6">
                    {!preview ? (
                        <label className="cursor-pointer">
                            <div className="px-6 py-3 bg-white border rounded-lg text-gray-700">
                                Choose File
                            </div>
                            <input
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept="image/*,.pdf"
                            />
                        </label>
                    ) : (
                        <div>
                            <img
                                src={preview}
                                alt="preview"
                                className="h-40 mx-auto rounded mb-4"
                            />
                            <button
                                className="text-red-600 underline"
                                onClick={() => {
                                    setPreview(null);
                                    setFile(null);
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    )}

                    {file && (
                        <button
                            onClick={handleSubmitOnline}
                            className="px-8 py-3 bg-green-600 text-white rounded-full mt-6"
                        >
                            Finish
                        </button>
                    )}
                </div>
            </div>
        );
    }

    return null;
};

export default PaymentPage;
