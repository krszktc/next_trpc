import { trpcReact } from "@/trpc/trpcReact";
import { CommentDto, PostDto } from "@/trpc/trpcRouter"
import { Card, Typography, Button, Box, Divider, TextareaAutosize } from "@mui/material"
import { error } from "console";
import { ChangeEvent, useState } from "react"


export const PostComponent = ({ id, content, commentsCount }: PostDto) => {
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [newComment, setNewComment] = useState('');

  const { refetch } = trpcReact.getComments.useQuery({ postId: id }, { enabled: false });
  const saveComments = trpcReact.saveComment.useMutation({
    onSuccess: (data) => {
      setComments([...comments, data])
      setNewComment('');
    },
    onError: (err) => {
      // show badge, chip, notification, etc
      console.error(err);
    }
  });

  const fetchComments = () => {
    refetch()
      .then(data => setComments(data.data ?? []))
      .catch(err => {
        // show badge, chip, notification, etc
        console.error(err.err);
      })
  }

  const onNewCommentChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setNewComment(event.target.value);
  }

  const onCommentSubmit = () => {
    saveComments.mutate({
      postId: id,
      content: newComment
    })
  }

  return (
    <>
      <Card variant="outlined" sx={{ marginTop: 1, marginBottom: 1, padding: 2, background: '#f5f5f5' }}>
        <Typography>{content}</Typography>
        <Button variant="outlined" size="small" color="primary"
          onClick={fetchComments}
          sx={{ float: 'right', marginTop: 2 }}>
          comments: {commentsCount}</Button>
      </Card>
      {comments && comments.length > 0 &&
        <Box display='flex'>
          <TextareaAutosize
            minRows={3}
            value={newComment}
            onChange={onNewCommentChange}
            style={{ width: '100%', marginRight: 10 }}
          />
          <Button variant="outlined" size="small" color="primary"
            onClick={onCommentSubmit}
            sx={{ maxHeight: 50 }}
          >
            Submit
          </Button>
        </Box>
      }
      {
        comments?.map((comment) =>
          <Box key={comment.id} margin={2}>
            <Divider sx={{ marginBottom: 2 }} />
            {comment.content}
          </Box>)
      }
    </>
  )
}