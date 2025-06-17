import { useEffect } from 'react';
import { StreamVideoClient } from '@stream-io/video-react-sdk';
import { useCallStore } from '@/src/store/useCallStore';

export const useInitStreamCall = ({
  user,
  token,
  apiKey,
  callId,
}: {
  user: { id: string; name: string; image: string };
  token: string;
  apiKey: string;
  callId: string;
}) => {
  const { setClient, setCall } = useCallStore();

  useEffect(() => {
    const init = async () => {
      const client = new StreamVideoClient({ apiKey, user, token });
      const call = client.call('default', callId);
      setClient(client);
      setCall(call);
    };

    init();
  }, [user.id, token, apiKey, callId]);
};
