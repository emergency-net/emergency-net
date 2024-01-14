import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type SimpleModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (nick: string) => void;
};

const BanDialog: React.FC<SimpleModalProps> = ({ open, onClose, onSubmit }) => {
  const [nick, setNick] = useState("");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Banlamak istediğiniz PU'yu girin.</DialogTitle>
        <div className="my-1">
          <Input
            placeholder="cisel@ortabayir.com"
            value={nick}
            onChange={(e) => setNick(e.target.value)}
          />
        </div>
        <DialogFooter className="flex flex-row gap-2 justify-stretch">
          <Button onClick={onClose} className="flex-1">
            İptal
          </Button>
          <Button onClick={() => onSubmit(nick)} className="flex-1">
            Devam Et
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BanDialog;
