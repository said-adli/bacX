-- The Power RPC: Collapse 5 queries into 1
-- get_lesson_full_context

CREATE OR REPLACE FUNCTION get_lesson_full_context(p_lesson_id uuid, p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_build_object(
        'lesson', jsonb_build_object(
            'id', l.id,
            'title', l.title,
            'type', l.type,
            'video_url', l.video_url,
            'required_plan_id', l.required_plan_id,
            'is_free', l.is_free,
            'pdf_url', l.pdf_url,
            'duration', l.duration,
            'is_purchasable', l.is_purchasable,
            'price', l.price
        ),
        'unit', jsonb_build_object(
            'id', u.id,
            'title', u.title
        ),
        'subject', jsonb_build_object(
            'id', s.id,
            'title', s.title,
            'is_active', s.is_active
        ),
        'user_context', jsonb_build_object(
            'has_plan', (
                SELECT EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = p_user_id 
                    AND is_subscribed = true 
                    AND (plan_id = l.required_plan_id OR l.required_plan_id IS NULL)
                )
            ),
            'owns_content', (
                SELECT EXISTS (
                    SELECT 1 FROM user_content_ownership 
                    WHERE user_id = p_user_id 
                    AND content_id = l.id
                )
            ),
            'is_admin', (
                SELECT EXISTS (
                    SELECT 1 FROM profiles 
                    WHERE id = p_user_id 
                    AND role IN ('admin', 'teacher')
                )
            ),
            'user_plan_id', (
                SELECT plan_id FROM profiles WHERE id = p_user_id
            ),
            'profile', (
                SELECT jsonb_build_object(
                    'id', id,
                    'role', role,
                    'plan_id', plan_id,
                    'is_subscribed', is_subscribed
                ) FROM profiles WHERE id = p_user_id
            )
        )
    ) INTO v_result
    FROM lessons l
    JOIN units u ON l.unit_id = u.id
    JOIN subjects s ON u.subject_id = s.id
    WHERE l.id = p_lesson_id;

    RETURN v_result;
END;
$$;
