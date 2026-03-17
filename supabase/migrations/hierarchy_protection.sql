-- Hierarchy Protection Trigger Ensure Unit -> Subject Chain
CREATE OR REPLACE FUNCTION check_lesson_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
    v_subject_id UUID;
BEGIN
    SELECT subject_id INTO v_subject_id
    FROM units
    WHERE id = NEW.unit_id;

    IF v_subject_id IS NULL THEN
        RAISE EXCEPTION 'Hierarchy Violation: Lesson % must belong to a Unit that is firmly attached to a Subject.', NEW.id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_lesson_hierarchy ON lessons;
CREATE TRIGGER trg_check_lesson_hierarchy
BEFORE INSERT OR UPDATE ON lessons
FOR EACH ROW
EXECUTE FUNCTION check_lesson_hierarchy();
