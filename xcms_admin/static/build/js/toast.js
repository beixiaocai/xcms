/**
 * 自定义Toast提示函数 - 无依赖、可复制到任何页面使用
 * @param {string} type - 提示类型: 'success'成功 | 'error'失败 | 'warning'警告
 * @param {string} message - 提示文本内容
 * @param {number} duration - 显示时长(毫秒)，默认2000ms
 */
function myToast2025(message, type, duration) {
    // 默认参数
    duration = duration || 2000;

    // 类型配置
    const config = {
        success: {
            icon: '✓',
            color: '#10b981',
            bg: '#d1fae5',
            border: '#6ee7b7'
        },
        error: {
            icon: '✕',
            color: '#ef4444',
            bg: '#fee2e2',
            border: '#fca5a5'
        },
        warning: {
            icon: '⚠',
            color: '#f59e0b',
            bg: '#fef3c7',
            border: '#fcd34d'
        }
    };

    const style = config[type] || config.success;

    // 创建Toast容器
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20%;
        left: 50%;
        transform: translateX(-50%);
        z-index: 999999;
        min-width: 300px;
        max-width: 500px;
        padding: 16px 20px;
        background: ${style.bg};
        border: 2px solid ${style.border};
        border-radius: 8px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        gap: 12px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        animation: toastSlideIn 0.3s ease;
        pointer-events: auto;
    `;

    // 图标
    const icon = document.createElement('span');
    icon.textContent = style.icon;
    icon.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: white;
        color: ${style.color};
        font-size: 16px;
        font-weight: bold;
        flex-shrink: 0;
    `;

    // 文本
    const text = document.createElement('span');
    text.textContent = message;
    text.style.cssText = `
        color: ${style.color};
        font-size: 14px;
        font-weight: 500;
        line-height: 1.5;
        flex: 1;
    `;

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        width: 20px;
        height: 20px;
        border: none;
        background: transparent;
        color: ${style.color};
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        opacity: 0.6;
        transition: opacity 0.2s;
        flex-shrink: 0;
    `;
    closeBtn.onmouseover = function() { this.style.opacity = '1'; };
    closeBtn.onmouseout = function() { this.style.opacity = '0.6'; };
    closeBtn.onclick = function() { removeToast(); };

    // 组装
    toast.appendChild(icon);
    toast.appendChild(text);
    toast.appendChild(closeBtn);

    // 添加动画样式（只添加一次）
    if (!document.getElementById('myToastStyles')) {
        const styleSheet = document.createElement('style');
        styleSheet.id = 'myToastStyles';
        styleSheet.textContent = `
            @keyframes toastSlideIn {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes toastSlideOut {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(styleSheet);
    }

    // 移除Toast
    function removeToast() {
        toast.style.animation = 'toastSlideOut 0.3s ease';
        setTimeout(function() {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 300);
    }

    // 添加到页面
    document.body.appendChild(toast);

    // 自动关闭
    setTimeout(removeToast, duration);

    return toast;
}