import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useLocalSearchParams, useFocusEffect, router } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { theme } from '../../../constants/theme'
import { Ionicons } from '@expo/vector-icons'
import { chatAPI } from '../../../services/api'
import Header from '../../../components/Header'
import { useAuth } from '../../../context/AuthContext'

const ChatScreen = () => {
  const { roomId } = useLocalSearchParams()
  const { currentUser } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUserName, setOtherUserName] = useState('')
  const [otherUserProfile, setOtherUserProfile] = useState(null)
  const flatListRef = useRef(null)

  const fetchMessages = async () => {
    try {
      const response = await chatAPI.getMessages(roomId)
      if (response.success) {
        setMessages(response.data)
        // Get other user info from first message
        if (response.data.length > 0) {
          const otherUser = response.data.find(msg => msg.sender.id !== currentUser?.id)
          if (otherUser) {
            setOtherUserName(otherUser.sender.name)
            setOtherUserProfile(otherUser.sender.profile_picture_urls)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  console.log('Messages:', messages)

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const response = await chatAPI.sendMessage(roomId, newMessage.trim())
      if (response.success) {
        setMessages(prev => [...prev, response.data])
        setNewMessage('')
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true })
        }, 100)
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const deleteMessage = async (messageId) => {
    try {
      const response = await chatAPI.deleteMessage(roomId, messageId)
      if (response.success) {
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, is_deleted: true, display_content: 'This message has been deleted' }
              : msg
          )
        )
      }
    } catch (error) {
      console.error('Error deleting message:', error)
      Alert.alert('Error', 'Failed to delete message')
    }
  }

  const handleLongPress = (message) => {
    if (message.sender.id === currentUser?.id && !message.is_deleted) {
      Alert.alert(
        'Delete Message',
        'Are you sure you want to delete this message?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Delete', 
            style: 'destructive',
            onPress: () => deleteMessage(message.id)
          }
        ]
      )
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchMessages()
    }, [roomId])
  )

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const renderMessage = ({ item }) => {
    const isMyMessage = item.sender.id === currentUser?.id
    const isDeleted = item.is_deleted

    console.log('is my message:', isMyMessage, ' item sender id:', item.sender.id, ' current user id:', currentUser?.id)
    return (
      <View style={styles.messageWrapper}>
        <TouchableOpacity
          style={[
            styles.messageContainer,
            isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
          ]}
          onLongPress={() => handleLongPress(item)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            isDeleted && styles.deletedMessageBubble
          ]}>
            <Text style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.otherMessageText,
              isDeleted && styles.deletedMessageText
            ]}>
              {item.display_content || item.content}
            </Text>
            <Text style={[
              styles.timeText,
              isMyMessage ? styles.myTimeText : styles.otherTimeText
            ]}>
              {formatTime(item.created_at)}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Chat" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </SafeAreaView>
    )
  }

  const renderChatHeader = () => (
    <View style={styles.chatHeader}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
      </TouchableOpacity>
      
      <View style={styles.profileSection}>
        <View style={styles.profilePicture}>
          {otherUserProfile?.thumbnail ? (
            <Image 
              source={{ uri: otherUserProfile.thumbnail }} 
              style={styles.profileImage}
            />
          ) : (
            <Ionicons name="person" size={24} color={theme.colors.textSubtle} />
          )}
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{otherUserName || 'Chat'}</Text>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      {renderChatHeader()}
      
      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSubtle}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Ionicons name="send" size={20} color="#ffffff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default ChatScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textSubtle,
  },
  chatContainer: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: theme.spacing.md,
  },
  messageWrapper: {
    marginVertical: theme.spacing.xs,
    width: '100%',
  },
  messageContainer: {
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: 18,
    minWidth: 60,
  },
  myMessageBubble: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  messageText: {
    fontSize: theme.typography.fontSize.base,
    lineHeight: 20,
    marginBottom: 2,
  },
  myMessageText: {
    color: '#ffffff',
  },
  otherMessageText: {
    color: theme.colors.textPrimary,
  },
  timeText: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  myTimeText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  otherTimeText: {
    color: theme.colors.textSubtle,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 20,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    marginRight: theme.spacing.sm,
    maxHeight: 100,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    backgroundColor: theme.colors.surface,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textSubtle,
  },
  deletedMessageBubble: {
    opacity: 0.6,
  },
  deletedMessageText: {
    fontStyle: 'italic',
    color: theme.colors.textSubtle,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.sm,
  },
  profileSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  userStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSubtle,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
})