import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Save, FileText, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PatientStepper } from '@/components/patients/PatientStepper';
import { DemographicStep } from '@/components/patients/DemographicStep';
import { HistoryStep } from '@/components/patients/HistoryStep';
import { PaymentStep } from '@/components/patients/PaymentStep';
import { ReviewStep } from '@/components/patients/ReviewStep';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { usePatient } from '@/hooks/useApiData';

const STEPS = [
	{ id: 1, title: 'Demographic Details' },
	{ id: 2, title: 'History' },
	{ id: 3, title: 'Payment' },
	{ id: 4, title: 'Review' },
];

export default function EditPatient() {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuth();
	const { data: patientData, isLoading } = usePatient(id || '');
	const [currentStep, setCurrentStep] = useState(1);
	const [photoUrl, setPhotoUrl] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [demographic, setDemographic] = useState({
		firstName: '',
		lastName: '',
		fatherSpouseName: '',
		gender: '',
		age: '',
		maritalStatus: '',
		phone: '',
		state: '',
		district: '',
		mandal: '',
		village: '',
		street: '',
	});
	const [history, setHistory] = useState({
		hasPreviousTreatment: '',
		conditions: [] as string[],
		previousHospital: '',
		currentMedications: '',
		pastSurgery: '',
	});
	const [payment, setPayment] = useState({
		paymentType: '',
		paymentPercentage: '',
	});

	useEffect(() => {
		if (patientData) {
			const addr = typeof patientData.address === 'object' ? patientData.address : null;
			setDemographic({
				firstName: patientData.firstName || patientData.name || '',
				lastName: patientData.lastName || patientData.surname || '',
				fatherSpouseName: patientData.fatherSpouseName || patientData.fatherName || '',
				gender: patientData.gender || '',
				age: patientData.age ? String(patientData.age) : '',
				maritalStatus: patientData.maritalStatus || '',
				phone: patientData.phoneNumber || patientData.phone || '',
				state: addr?.stateId !== undefined && addr?.stateId !== null ? String(addr.stateId) : '',
				district: addr?.districtId !== undefined && addr?.districtId !== null ? String(addr.districtId) : '',
				mandal: addr?.mandalId !== undefined && addr?.mandalId !== null ? String(addr.mandalId) : '',
				village: addr?.cityVillage || patientData.village || '',
				street: addr?.streetAddress || '',
			});
			setPhotoUrl(patientData.photoUrl || null);
			setHistory({
				hasPreviousTreatment: patientData.hasMedicalHistory ? 'yes' : 'no',
				conditions: patientData.medicalHistory?.conditions || [],
				previousHospital: patientData.medicalHistory?.previousHospital || '',
				currentMedications: patientData.medicalHistory?.currentMedications || '',
				pastSurgery: patientData.medicalHistory?.pastSurgery || '',
			});
			setPayment({
				paymentType: patientData.paymentType || '',
				paymentPercentage: patientData.paymentPercentage ? String(patientData.paymentPercentage) : '',
			});
		}
	}, [patientData]);

	const updateDemographic = (field: keyof typeof demographic, value: string) => {
		setDemographic((prev) => ({ ...prev, [field]: value }));
	};
	const updateHistory = <K extends keyof typeof history>(field: K, value: typeof history[K]) => {
		setHistory((prev) => ({ ...prev, [field]: value }));
	};
	const updatePayment = (field: keyof typeof payment, value: string) => {
		setPayment((prev) => ({ ...prev, [field]: value }));
	};

	const validateStep = (step: number): boolean => {
		switch (step) {
			case 1:
				if (!demographic.firstName || !demographic.fatherSpouseName || !demographic.gender || !demographic.age) {
					toast.error('Please fill in all required fields');
					return false;
				}
				return true;
			case 2:
				return true;
			case 3:
				if (!payment.paymentType) {
					toast.error('Please select a payment type');
					return false;
				}
				if (payment.paymentType === 'paid' && !payment.paymentPercentage) {
					toast.error('Please select a payment percentage');
					return false;
				}
				return true;
			default:
				return true;
		}
	};

	const handleNext = () => {
		if (validateStep(currentStep)) {
			setCurrentStep((prev) => Math.min(prev + 1, 4));
		}
	};
	const handleBack = () => {
		setCurrentStep((prev) => Math.max(prev - 1, 1));
	};

	const handleSaveDraft = () => {
		toast.success('Patient saved as draft');
		navigate('/patients');
	};

	const handleUpdatePatient = async () => {
		setIsSubmitting(true);
		try {
			toast.success('Patient updated successfully');
			navigate('/patients');
		} catch (e) {
			toast.error('Failed to update patient');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleSendToAdmin = () => {
		toast.success('Patient update sent to Administration for approval');
		navigate('/patients');
	};

	const handleCancel = () => {
		navigate('/patients');
	};

	const handleStepClick = (stepId: number) => {
		if (stepId < currentStep) {
			setCurrentStep(stepId);
		} else if (stepId === currentStep) {
			return;
		} else {
			let valid = true;
			for (let i = 1; i < stepId; i++) {
				if (!validateStep(i)) {
					valid = false;
					break;
				}
			}
			if (valid) setCurrentStep(stepId);
		}
	};

	if (isLoading) return <div>Loading...</div>;

	return (
		<DashboardLayout>
			<div className="space-y-4">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-semibold text-foreground">Edit Patient</h1>
					<Button variant="outline" size="sm" onClick={handleCancel} disabled={isSubmitting}>
						<X className="h-4 w-4 mr-1" />
						Cancel
					</Button>
				</div>
				<div className="bg-card border rounded-lg p-4">
					<PatientStepper steps={STEPS} currentStep={currentStep} onStepClick={handleStepClick} />
				</div>
				<div className="min-h-[400px]">
					{currentStep === 1 && (
						<DemographicStep
							data={demographic}
							photoUrl={photoUrl}
							onUpdate={updateDemographic}
							onPhotoChange={setPhotoUrl}
						/>
					)}
					{currentStep === 2 && (
						<HistoryStep
							data={{
								hasPreviousTreatment: history.hasPreviousTreatment,
								conditions: Array.isArray(history.conditions) ? history.conditions.map(String) : [],
								previousHospital: history.previousHospital,
								currentMedications: history.currentMedications,
								pastSurgery: history.pastSurgery,
							}}
							onUpdate={updateHistory}
						/>
					)}
					{currentStep === 3 && (
						<PaymentStep data={payment} onUpdate={updatePayment} />
					)}
					{currentStep === 4 && (
						<ReviewStep demographic={demographic} history={history} payment={payment} photoUrl={photoUrl} />
					)}
				</div>
				<div className="flex items-center justify-between border-t pt-4">
					<div>
						{currentStep > 1 && (
							<Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
								<ChevronLeft className="h-4 w-4 mr-1" />
								Back
							</Button>
						)}
					</div>
					<div className="flex gap-2">
						{currentStep < 4 ? (
							<Button onClick={handleNext} className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
								Next
								<ChevronRight className="h-4 w-4 ml-1" />
							</Button>
						) : (
							<>
								<Button variant="outline" onClick={handleSaveDraft} disabled={isSubmitting}>
									<Save className="h-4 w-4 mr-1" />
									Save (Draft)
								</Button>
								<Button onClick={handleUpdatePatient} className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
									<FileText className="h-4 w-4 mr-1" />
									Update Patient
								</Button>
								<Button variant="secondary" onClick={handleSendToAdmin} disabled={isSubmitting}>
									<ShieldCheck className="h-4 w-4 mr-1" />
									Send to Administration
								</Button>
							</>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
}
