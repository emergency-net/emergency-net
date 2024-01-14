import React, { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/Components/ui/alert-dialog";

type AreYouSureDialogProps = {
  onAccept: () => void;
  title: string;
  children: ReactNode;
  className?: string;
};

const AreYouSureDialog: React.FC<AreYouSureDialogProps> = ({
  onAccept: onClick,
  title,
  children,
  className,
}) => {
  return (
    <div className={className} onClick={(e) => e.stopPropagation()}>
      <AlertDialog>
        <AlertDialogTrigger>{children}</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={onClick}>Devam Et</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AreYouSureDialog;
