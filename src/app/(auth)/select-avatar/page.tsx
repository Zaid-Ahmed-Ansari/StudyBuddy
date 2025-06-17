// app/select-avatar/page.tsx
import { redirect } from 'next/navigation';
import dbConnect from '@/src/lib/dbConnect';
import { UserModel } from '@/src/model/User';
import AvatarPicker from '@/components/AvatarPicker'; 

interface Props {
  searchParams: { username: string }; 
}

export default async function SelectAvatarPage({ searchParams }: Props) {
  const { username: usernameParam } = await  searchParams;
  const username =  usernameParam;

  if (!username) {
    redirect('/sign-in');
  }

  await dbConnect();
  const user = await UserModel.findOne({ username }).lean();

  if (!user || user.hasSelectedAvatar) {
    redirect('/');
  }

  return (
    <main className="max-w-xl mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold text-center mb-2 text-accent">Choose Your Avatar</h1>
      <p className="text-center text-sm text-red-600 font-medium mb-6">
        ⚠️ You can select your avatar only once. This cannot be changed later.
      </p>
      <AvatarPicker username={username} />
    </main>
  );
}

