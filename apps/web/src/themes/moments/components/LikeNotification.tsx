
interface LikeNotificationProps {
  likes: any[];
  alwaysShow?: boolean; // 是否在没有点赞时也显示
}

export default function LikeNotification({ likes, alwaysShow = false }: LikeNotificationProps) {
  if (!likes || likes.length === 0) {
    // 如果设置了alwaysShow，显示空状态
    if (alwaysShow) {
      return (
        <div className="moments-likes-section">
          <div className="moments-likes-icon">❤️</div>
          <div className="moments-likes-content">
            <span className="text-gray-400 text-sm">暂无点赞</span>
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="moments-likes-section">
      <div className="moments-likes-icon">❤️</div>
      <div className="moments-likes-content">
        {likes.map((like, index) => (
          <span key={like.id}>
            <span className="moments-likes-username">{like.user.username}</span>
            {index < likes.length - 1 && <span className="moments-likes-separator">，</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
