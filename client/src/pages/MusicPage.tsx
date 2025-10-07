import SharedPlaylist from '../components/SharedPlaylist'

export default function MusicPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Music</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4 space-y-3">
          <div className="font-semibold">Spotify</div>
          <iframe
            className="w-full rounded-xl"
            style={{ border: 0, height: 380 }}
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
        <div className="card p-4 space-y-3">
          <div className="font-semibold">YouTube</div>
          <iframe
            className="w-full rounded-xl"
            style={{ border: 0, height: 380 }}
            src="https://www.youtube.com/embed?listType=playlist&list=PLMC9KNkIncKtPzgY-5rmhvj7fax8fdxoj"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
      <div>
        <SharedPlaylist />
      </div>
    </div>
  )
}

