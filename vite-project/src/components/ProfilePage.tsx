import { useState } from "react";
import {
  User,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/firebase/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const [user] = useState<User | null>(auth.currentUser);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Reauthenticate user before deleting account
  const handleDeleteAccount = async () => {
    if (!user) return;

    try {
      // Ensure user is reauthenticated before deletion
      if (user.email) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Delete the user account
      await deleteUser(user);

      // User will be automatically signed out after account deletion
    } catch (error: any) {
      console.error("Account deletion error:", error);
      setError(error.message || "Failed to delete account. Please try again.");
    }
  };

  if (!user) {
    return <div>No user logged in</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic User Information */}
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="bg-muted p-2 rounded">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label>User ID</Label>
            <p className="bg-muted p-2 rounded">{user.uid}</p>
          </div>

          <div className="space-y-2">
            <Label>Account Created</Label>
            <p className="bg-muted p-2 rounded">{user.metadata.creationTime}</p>
          </div>

          {/* Delete Account Dialog */}
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogDescription>
                  This will permanently delete your account. This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="delete-password">
                    Confirm Password to Delete Account
                  </Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={handleDeleteAccount}
                  disabled={!password}
                >
                  Confirm Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
