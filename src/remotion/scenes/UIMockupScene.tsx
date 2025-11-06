import React from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { UIMockupProps } from '@/types/videoJSON';
import { glassmorphicStyle, glassmorphicCard } from '../utils/glassmorphism';
import { AnimatedText } from '../components/AnimatedText';
import { Plane, ArrowRight } from 'lucide-react';

interface UIMockupSceneProps extends UIMockupProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  frame?: number; // Optional frame override (for use in VideoComposition)
}

export const UIMockupScene: React.FC<UIMockupSceneProps> = ({
  sections,
  layout,
  background,
  animations,
  primaryColor,
  secondaryColor,
  accentColor,
  fontFamily,
  frame: frameProp,
}) => {
  const currentFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Use provided frame or fall back to current frame
  const frame = frameProp !== undefined ? frameProp : currentFrame;

  // Render background
  const renderBackground = () => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: '100%',
      height: '100%',
    };

    if (background.type === 'gradient') {
      return (
        <AbsoluteFill
          style={{
            ...baseStyle,
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%)`,
          }}
        />
      );
    }

    if (background.type === 'pattern') {
      if (background.pattern === 'ribbed') {
        return (
          <AbsoluteFill
            style={{
              ...baseStyle,
              background: background.color || '#f3f4f6',
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 20px,
                rgba(255,255,255,0.05) 20px,
                rgba(255,255,255,0.05) 40px
              )`,
            }}
          />
        );
      }
      if (background.pattern === 'grid') {
        return (
          <AbsoluteFill
            style={{
              ...baseStyle,
              background: background.color || '#f3f4f6',
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
            }}
          />
        );
      }
      if (background.pattern === 'dots') {
        return (
          <AbsoluteFill
            style={{
              ...baseStyle,
              background: background.color || '#f3f4f6',
              backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)',
              backgroundSize: '30px 30px',
            }}
          />
        );
      }
    }

    return (
      <AbsoluteFill
        style={{
          ...baseStyle,
          backgroundColor: background.color || '#f3f4f6',
        }}
      />
    );
  };

  // Render section content based on type
  const renderSectionContent = (section: UIMockupProps['sections'][0], delay: number) => {
    const { content, type } = section;

    if (type === 'form') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          {content.title && (
            <AnimatedText
              text={content.title}
              animation="fadeIn"
              frame={frame - delay - 10}
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                fontFamily,
                color: '#1a1a1a',
                marginBottom: 8,
              }}
            />
          )}

          {content.fields?.map((field, i) => {
            const fieldDelay = delay + 20 + i * 5;
            const fieldProgress = spring({
              frame: frame - fieldDelay,
              fps,
              config: { damping: 100, stiffness: 200 },
            });
            const fieldOpacity = interpolate(fieldProgress, [0, 1], [0, 1]);
            const fieldY = interpolate(fieldProgress, [0, 1], [10, 0]);

            return (
              <div
                key={i}
                style={{
                  opacity: fieldOpacity,
                  transform: `translateY(${fieldY}px)`,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: '#666',
                    marginBottom: 4,
                    fontFamily,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}
                >
                  {field.label}
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 500,
                    color: '#1a1a1a',
                    fontFamily,
                  }}
                >
                  {field.value}
                </div>
              </div>
            );
          })}

          {content.button && (
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 20,
              }}
            >
              <button
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px 28px',
                  fontSize: 16,
                  fontWeight: 600,
                  fontFamily,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}
              >
                {content.button.text}
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      );
    }

    if (type === 'ticket') {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            color: 'white',
            fontFamily,
          }}
        >
          {content.title && (
            <AnimatedText
              text={content.title}
              animation="fadeIn"
              frame={frame - delay - 10}
              style={{
                fontSize: 28,
                fontWeight: 'bold',
                marginBottom: 24,
              }}
            />
          )}

          {content.fields?.map((field, i) => {
            if (field.label === 'From' || field.label === 'To') {
              return (
                <div
                  key={i}
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                      {field.label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600 }}>{field.value}</div>
                  </div>
                  {i === 0 && (
                    <Plane
                      size={20}
                      style={{ opacity: 0.7, marginLeft: 'auto', marginRight: 'auto' }}
                    />
                  )}
                </div>
              );
            }

            return (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 4 }}>
                  {field.label}
                </div>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{field.value}</div>
              </div>
            );
          })}

          {content.barcode && (
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 20,
                borderTop: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <div
                style={{
                  height: '60px',
                  background: `repeating-linear-gradient(
                    90deg,
                    #fff 0px,
                    #fff 2px,
                    transparent 2px,
                    transparent 4px
                  )`,
                  backgroundSize: '4px 100%',
                  borderRadius: '4px',
                }}
              />
            </div>
          )}
        </div>
      );
    }

    if (type === 'card') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>
          {content.title && (
            <AnimatedText
              text={content.title}
              animation="fadeIn"
              frame={frame - delay - 10}
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                fontFamily,
                color: '#1a1a1a',
              }}
            />
          )}

          {content.fields?.map((field, i) => (
            <div key={i}>
              <div
                style={{
                  fontSize: 14,
                  color: '#666',
                  marginBottom: 4,
                  fontFamily,
                }}
              >
                {field.label}
              </div>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#1a1a1a',
                  fontFamily,
                }}
              >
                {field.value}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Default info type
    return (
      <div>
        {content.title && (
          <AnimatedText
            text={content.title}
            animation="fadeIn"
            frame={frame - delay - 10}
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              fontFamily,
              marginBottom: 16,
            }}
          />
        )}
        {content.fields?.map((field, i) => (
          <div key={i} style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 4 }}>{field.label}</div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{field.value}</div>
          </div>
        ))}
      </div>
    );
  };

  // Render sections with animations
  const renderSections = () => {
    return sections.map((section, index) => {
      const delay = index * animations.stagger;
      const progress = spring({
        frame: frame - delay,
        fps,
        config: { damping: 100, stiffness: 200 },
      });

      let opacity = interpolate(progress, [0, 1], [0, 1]);
      let translateY = 0;
      let scale = 1;

      if (animations.entrance === 'slideUp') {
        translateY = interpolate(progress, [0, 1], [50, 0]);
      } else if (animations.entrance === 'scale') {
        scale = interpolate(progress, [0, 1], [0.8, 1]);
      } else if (animations.entrance === 'flip') {
        const rotateX = interpolate(progress, [0, 1], [90, 0]);
        return (
          <div
            key={section.id}
            style={{
              position: 'absolute',
              left: `${section.position.x}%`,
              top: `${section.position.y}%`,
              width: `${section.position.width}%`,
              height: `${section.position.height}%`,
              opacity,
              transform: `perspective(1000px) rotateX(${rotateX}deg) scale(${scale})`,
              transformStyle: 'preserve-3d',
              ...glassmorphicCard({
                opacity: section.style.opacity || 0.3,
                blur: section.style.blur || 15,
                borderRadius: 24,
                padding: 32,
                backgroundColor: section.style.backgroundColor,
              }),
              ...(section.style.gradient && {
                background: `linear-gradient(135deg, ${section.style.gradient[0]}, ${section.style.gradient[1]})`,
              }),
            }}
          >
            {renderSectionContent(section, delay)}
          </div>
        );
      }

      return (
        <div
          key={section.id}
          style={{
            position: 'absolute',
            left: `${section.position.x}%`,
            top: `${section.position.y}%`,
            width: `${section.position.width}%`,
            height: `${section.position.height}%`,
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            ...glassmorphicCard({
              opacity: section.style.opacity || 0.3,
              blur: section.style.blur || 15,
              borderRadius: 24,
              padding: 32,
              backgroundColor: section.style.backgroundColor,
            }),
            ...(section.style.gradient && {
              background: `linear-gradient(135deg, ${section.style.gradient[0]}, ${section.style.gradient[1]})`,
            }),
          }}
        >
          {renderSectionContent(section, delay)}
        </div>
      );
    });
  };

  return (
    <AbsoluteFill>
      {renderBackground()}
      {renderSections()}
    </AbsoluteFill>
  );
};

