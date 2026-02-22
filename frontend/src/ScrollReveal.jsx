import { useEffect, useRef, useState } from 'react';

export function ScrollReveal({
    children,
    className = '',
    threshold = 0.15,
    delay = 0,
    duration = 0.8,
    direction = 'up',   // 'up', 'down', 'left', 'right', 'none'
    distance = 40,
    scale = 1,
    once = true
}) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    if (once) observer.unobserve(el);
                }
            },
            { rootMargin: '0px 0px -60px 0px', threshold }
        );

        observer.observe(el);
        return () => observer.unobserve(el);
    }, [threshold, once]);

    const transforms = [];
    if (direction === 'up') transforms.push(`translateY(${distance}px)`);
    if (direction === 'down') transforms.push(`translateY(-${distance}px)`);
    if (direction === 'left') transforms.push(`translateX(${distance}px)`);
    if (direction === 'right') transforms.push(`translateX(-${distance}px)`);
    if (scale !== 1) transforms.push(`scale(${scale})`);

    const initTransform = transforms.join(' ') || 'none';

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0) translateX(0) scale(1)' : initTransform,
                transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
                willChange: 'opacity, transform',
            }}
        >
            {children}
        </div>
    );
}
