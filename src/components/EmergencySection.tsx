import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Globe } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Message {
  id: number;
  username: string;
  message: string;
  node: string;
  timestamp: string;
  priority: string;
}

const EmergencySection = () => {
  const [emergencyMessages, setEmergencyMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Initial fetch of messages
    fetchMessages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchMessages();
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    try {
      console.log('Fetching messages...');
      // Fetch messages from the messages table
      const { data, error } = await supabase
        .from('messages')
        .select('*') // Select all fields
        .order('id', { ascending: false }); // Order by id instead of timestamp

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      console.log('Received data from messages table:', data);

      if (!data || data.length === 0) {
        // If no messages, set some default messages
        const defaultMessages = [
          {
            id: 1,
            username: "System",
            message: "⚠️ High risk of landslide detected in Wayanad region",
            node: "Central Node",
            timestamp: "10:30 AM",
            priority: "high"
          },
          {
            id: 2,
            username: "System",
            message: "🚨 Emergency response team dispatched to affected area",
            node: "Central Node",
            timestamp: "10:35 AM",
            priority: "high"
          },
          {
            id: 3,
            username: "System",
            message: "ℹ️ Local authorities have been notified",
            node: "Central Node",
            timestamp: "10:40 AM",
            priority: "medium"
          },
          {
            id: 4,
            username: "System",
            message: "📢 Evacuation procedures initiated in high-risk zones",
            node: "Central Node",
            timestamp: "10:45 AM",
            priority: "high"
          }
        ];
        setEmergencyMessages(defaultMessages);
        return;
      }

      const formattedMessages = data.map(msg => ({
        id: msg.id,
        username: msg.username || 'Unknown',
        message: msg.message || '',
        node: msg.from_node || '',
        timestamp: new Date(msg.created_at).toLocaleTimeString(),
        priority: 'medium'
      }));

      console.log('Formatted messages:', formattedMessages);
      setEmergencyMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // On error, show default messages
      const defaultMessages = [
        {
          id: 1,
          username: "System",
          message: "⚠️ High risk of landslide detected in Wayanad region",
          node: "Central Node",
          timestamp: "10:30 AM",
          priority: "high"
        },
        {
          id: 2,
          username: "System",
          message: "🚨 Emergency response team dispatched to affected area",
          node: "Central Node",
          timestamp: "10:35 AM",
          priority: "high"
        }
      ];
      setEmergencyMessages(defaultMessages);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* World Map Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <span>Global Emergency Map</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/9] bg-muted rounded-lg overflow-hidden">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d15735.325582281553!2d76.08340955!3d10.7864805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sin!4v1627366482244!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Chat Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-destructive">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
              </span>
              <span>MM32 Chats</span>
            </div>
            <button
              onClick={() => fetchMessages()}
              className="hover:bg-muted p-2 rounded-full transition-colors"
              title="Refresh messages"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin-hover"
              >
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              {emergencyMessages.map((message) => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg ${
                    message.priority === "high" 
                      ? "bg-destructive/10 border border-destructive/20" 
                      : "bg-muted"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-primary">{message.username}</span>
                      <span className="text-xs text-muted-foreground">{message.timestamp}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm whitespace-pre-line">{message.message}</p>
                      <p className="text-xs text-muted-foreground">Node: {message.node}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmergencySection;
