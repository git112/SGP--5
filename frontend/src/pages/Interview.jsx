import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import LoadingScreen from "../components/LoadingScreen";
import { useAuth } from "../context/AuthContext";



export default function Interview() {
	const { interviewId } = useParams();
	const [questions, setQuestions] = useState([]);
	const [totalTime, setTotalTime] = useState(0);
	const [toast, setToast] = useState({
		show: false,
		message: "",
		type: "success",
	});
	const { loading, setLoading } = useAuth();
	const navigate = useNavigate();

	const showToast = (message, type) => {
		setToast({ show: true, message, type });
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, show: false }));
	};

	useEffect(() => {
		const fetchQuestions = async () => {
			try {
				const res = await axios.get(
					`${
						import.meta.env.VITE_API_URL
					}/api/interview/${interviewId}`
				);
				setQuestions(res.data.questions);
			} catch (err) {
				showToast(err.message || "Failed to load questions.", "error");
			}
		};
		fetchQuestions();
	}, [interviewId]);

	useEffect(() => {
		const totalTimer = setInterval(() => {
			setTotalTime((prev) => prev + 1);
		}, 1000);
		return () => clearInterval(totalTimer);
	}, []);

	const formatTotalTime = (seconds) => {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		const remainingSeconds = seconds % 60;
		return {
			hours: hours.toString().padStart(2, "0"),
			minutes: minutes.toString().padStart(2, "0"),
			seconds: remainingSeconds.toString().padStart(2, "0"),
		};
	};


	const totalTimeFormatted = formatTotalTime(totalTime);

	if (loading) {
		return <LoadingScreen message="Analyzing your Answer..." showProgress />;
	}

	return (
		<div className="min-h-screen bg-gray-50">
			{toast.show && (
				<Toast
					message={toast.message}
					type={toast.type}
					onClose={hideToast}
				/>
			)}

			<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-900 mb-2">
						Interview
					</h1>
					<p className="text-gray-600">
						Practice answering common interview questions in a
						simulated environment
					</p>
				</div>

				{questions.length > 0 && (
					<div className="space-y-6 mb-8">
						<div className="text-center mb-6">
							<h2 className="text-2xl font-bold text-gray-900 mb-2">
								All Interview Questions ({questions.length} total)
							</h2>
							<p className="text-gray-600">
								Review all questions for this interview session
							</p>
						</div>
						
						{questions.map((question, index) => (
							<div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
								<div className="flex justify-between items-center mb-4">
									<div className="text-sm font-medium text-gray-700">
										Question {index + 1} of {questions.length}
									</div>
									{question.category && (
										<span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
											{question.category}
										</span>
									)}
								</div>

								<div className="mb-4">
									<h3 className="text-lg font-medium text-gray-900 leading-relaxed">
										{question.question || question.text}
									</h3>
								</div>

								{question.tags && question.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mb-4">
										{question.tags.map((tag, tagIndex) => (
											<span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
												{tag}
											</span>
										))}
									</div>
								)}

								{question.round && (
									<div className="text-sm text-gray-500">
										Round: {question.round}
									</div>
								)}
							</div>
						))}
					</div>
				)}

				<div className="flex justify-center space-x-4">
					<div className="bg-gray-200 rounded-lg px-6 py-4 text-center">
						<div className="text-2xl font-bold text-gray-900">
							{totalTimeFormatted.hours}
						</div>
						<div className="text-sm text-gray-600">Hours</div>
					</div>
					<div className="bg-gray-200 rounded-lg px-6 py-4 text-center">
						<div className="text-2xl font-bold text-gray-900">
							{totalTimeFormatted.minutes}
						</div>
						<div className="text-sm text-gray-600">Minutes</div>
					</div>
					<div className="bg-gray-200 rounded-lg px-6 py-4 text-center">
						<div className="text-2xl font-bold text-gray-900">
							{totalTimeFormatted.seconds}
						</div>
						<div className="text-sm text-gray-600">Seconds</div>
					</div>
				</div>
			</main>
		</div>
	);
}