"use client";

import { trpcReact } from "@/trpc/trpcReact";
import { PostDto } from "@/trpc/trpcRouter";
import { Alert, Box, Button, Container, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { json } from "stream/consumers";
import { PostComponent } from "./PostComponent";

export default function Home() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [error, setError] = useState('');

  const { getPosts } = trpcReact.useUtils();

  const loadAndMerge = () => {
    const cursor = posts.length ? posts[posts.length - 1].id : null;
    getPosts.fetch({ cursor })
      .then(data => setPosts([...posts, ...data]))
      .catch(error => setError(error.message))
  }

  useEffect(() => {
    loadAndMerge()
  }, [])

  return (
    <main>
      <Typography variant="h4" component={"h1"}>
        Posts
      </Typography>
      <Container maxWidth='md'>
        {
          posts.map(post => <PostComponent key={post.id} {...post} />)
        }
        {error &&
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        }
      </Container>
      <Box display='flex' justifyContent='center' margin={2}>
        {posts.length > 0 &&
          <Button onClick={loadAndMerge} size="large" variant="contained">Load more</Button>
        }
      </Box>
    </main>
  );
}
