import { useState, useRef } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface PhotoUploadProps {
  currentPhoto?: string;
  onPhotoChange: (photoUrl: string | null) => void;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PhotoUpload({ currentPhoto, onPhotoChange, name = '', size = 'lg' }: PhotoUploadProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-32 w-32',
  };

  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onPhotoChange(url);
    }
    setShowDialog(false);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      setStream(mediaStream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      alert('Unable to access camera. Please check permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewUrl(dataUrl);
        onPhotoChange(dataUrl);
      }
    }
    stopCamera();
    setShowDialog(false);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      stopCamera();
    }
    setShowDialog(open);
  };

  const removePhoto = () => {
    setPreviewUrl(null);
    onPhotoChange(null);
  };

  return (
    <>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <Avatar className={sizeClasses[size]}>
            <AvatarImage src={previewUrl || undefined} alt="Photo" />
            <AvatarFallback className="bg-accent/10 text-accent text-xl">
              {name ? getInitials(name) : <User className={iconSizes[size]} />}
            </AvatarFallback>
          </Avatar>
          {previewUrl && (
            <button
              onClick={removePhoto}
              className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 shadow-lg hover:bg-destructive/90 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowDialog(true)}
            className="text-xs"
          >
            <Camera className="h-3 w-3 mr-1" />
            Camera
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs"
          >
            <Upload className="h-3 w-3 mr-1" />
            Upload
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <Dialog open={showDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Take Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {isCameraActive ? (
              <>
                <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={stopCamera}>
                    Cancel
                  </Button>
                  <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={capturePhoto}>
                    <Camera className="h-4 w-4 mr-2" />
                    Capture
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
                  <div className="text-center">
                    <Camera className="h-16 w-16 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click Start Camera to begin</p>
                  </div>
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90" onClick={startCamera}>
                  <Camera className="h-4 w-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
